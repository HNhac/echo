import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { HostGuestStat, HostRecentVisit } from "@echo/shared";
import { dataDir } from "./db.js";

export type VisitDay = { date: string; hits: number; uniques: number };

type GuestStore = {
  ip: string;
  hits: number;
  todayDate: string;
  todayHits: number;
  firstAt: string;
  lastAt: string;
  lastPath: string;
  pages: Record<string, number>;
};

type VisitStore = {
  days: Record<string, { hits: number; uniques: number }>;
  today: { date: string; hits: number; hashes: string[] };
  recent: HostRecentVisit[];
  guests: Record<string, GuestStore>;
};

const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview/i;
const RECENT_KEEP = 120;
const RECENT_SHOW = 80;
const GUEST_KEEP = 80;
const GUEST_SHOW = 50;

function visitsPath() {
  return join(dataDir, "visits.json");
}

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function emptyStore(date = todayKey()): VisitStore {
  return { days: {}, today: { date, hits: 0, hashes: [] }, recent: [], guests: {} };
}

export function sanitizeVisitPath(raw?: string) {
  if (!raw || typeof raw !== "string") return "/";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/";
  try {
    const url = new URL(trimmed, "https://echo.local");
    if (url.origin !== "https://echo.local") return "/";
    const path = url.pathname || "/";
    return path.length > 180 ? path.slice(0, 180) : path;
  } catch {
    return "/";
  }
}

export function displayIp(ip: string) {
  const raw = ip.trim();
  if (!raw || raw === "unknown") return "";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

function bumpGuest(store: VisitStore, row: HostRecentVisit) {
  const ip = displayIp(row.ip) || row.ip || "unknown";
  const path = sanitizeVisitPath(row.path);
  const date = todayKey(new Date(row.at));
  const cur = store.guests[ip];
  if (!cur) {
    store.guests[ip] = {
      ip,
      hits: 1,
      todayDate: date,
      todayHits: date === todayKey() ? 1 : 0,
      firstAt: row.at,
      lastAt: row.at,
      lastPath: path,
      pages: { [path]: 1 },
    };
    return;
  }
  cur.hits += 1;
  if (cur.todayDate !== todayKey()) {
    cur.todayDate = todayKey();
    cur.todayHits = 0;
  }
  if (date === todayKey()) cur.todayHits += 1;
  if (row.at >= cur.lastAt) {
    cur.lastAt = row.at;
    cur.lastPath = path;
  }
  if (row.at < cur.firstAt) cur.firstAt = row.at;
  cur.pages[path] = (cur.pages[path] ?? 0) + 1;
}

function rebuildGuests(store: VisitStore) {
  store.guests = {};
  for (const row of [...store.recent].reverse()) bumpGuest(store, row);
}

function loadStore(): VisitStore {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(visitsPath())) return emptyStore();
  try {
    const raw = JSON.parse(readFileSync(visitsPath(), "utf8")) as Partial<VisitStore>;
    if (!raw?.today?.date) return emptyStore();
    const store: VisitStore = {
      days: raw.days ?? {},
      today: raw.today,
      recent: Array.isArray(raw.recent) ? raw.recent : [],
      guests: raw.guests && typeof raw.guests === "object" ? raw.guests : {},
    };
    if (!Object.keys(store.guests).length && store.recent.length) rebuildGuests(store);
    const today = todayKey();
    for (const guest of Object.values(store.guests)) {
      if (guest.todayDate !== today) {
        guest.todayDate = today;
        guest.todayHits = 0;
      }
    }
    if (store.today.date !== today) {
      store.days[store.today.date] = {
        hits: store.today.hits,
        uniques: store.today.hashes.length,
      };
      store.today = { date: today, hits: 0, hashes: [] };
      prune(store);
      saveStore(store);
    }
    return store;
  } catch {
    return emptyStore();
  }
}

function prune(store: VisitStore) {
  const keys = Object.keys(store.days).sort();
  while (keys.length > 90) {
    const old = keys.shift();
    if (old) delete store.days[old];
  }
  if (store.recent.length > RECENT_KEEP) store.recent = store.recent.slice(0, RECENT_KEEP);
  const guests = Object.values(store.guests).sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  if (guests.length > GUEST_KEEP) {
    store.guests = {};
    for (const guest of guests.slice(0, GUEST_KEEP)) store.guests[guest.ip] = guest;
  }
}

function saveStore(store: VisitStore) {
  writeFileSync(visitsPath(), `${JSON.stringify(store)}\n`);
}

function hashIp(ip: string, date: string) {
  return createHash("sha256").update(`${date}|${ip}`).digest("hex").slice(0, 16);
}

function toGuestStat(guest: GuestStore): HostGuestStat {
  const pages = Object.entries(guest.pages)
    .map(([path, hits]) => ({ path, hits }))
    .sort((a, b) => b.hits - a.hits || a.path.localeCompare(b.path))
    .slice(0, 6);
  return {
    ip: displayIp(guest.ip) || guest.ip,
    hits: guest.hits,
    todayHits: guest.todayDate === todayKey() ? guest.todayHits : 0,
    lastAt: guest.lastAt,
    lastPath: sanitizeVisitPath(guest.lastPath),
    pages,
  };
}

export function clientIp(headers: { get(name: string): string | null | undefined }) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  return displayIp(forwarded || real || "");
}

export function recordVisit(input: { ip: string; agent?: string; path?: string }) {
  const agent = input.agent ?? "";
  if (BOT.test(agent)) return { ok: true as const, skipped: "bot" };
  const ip = displayIp(input.ip) || "unknown";
  const path = sanitizeVisitPath(input.path);
  const at = new Date().toISOString();
  const store = loadStore();
  const date = todayKey();
  const hash = hashIp(ip, date);
  store.today.hits += 1;
  if (!store.today.hashes.includes(hash)) {
    store.today.hashes.push(hash);
    if (store.today.hashes.length > 20000) store.today.hashes = store.today.hashes.slice(-15000);
  }
  store.recent.unshift({ at, ip, path });
  if (store.recent.length > RECENT_KEEP) store.recent = store.recent.slice(0, RECENT_KEEP);
  bumpGuest(store, { at, ip, path });
  prune(store);
  saveStore(store);
  return { ok: true as const };
}

export function visitSummary() {
  const store = loadStore();
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  const y = store.days[yesterday];
  const last7: VisitDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = todayKey(new Date(Date.now() - i * 86400000));
    if (date === store.today.date) {
      last7.push({ date, hits: store.today.hits, uniques: store.today.hashes.length });
    } else {
      const row = store.days[date];
      last7.push({ date, hits: row?.hits ?? 0, uniques: row?.uniques ?? 0 });
    }
  }
  const guests = Object.values(store.guests)
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .slice(0, GUEST_SHOW)
    .map(toGuestStat);
  return {
    hitsToday: store.today.hits,
    uniqueToday: store.today.hashes.length,
    hitsYesterday: y?.hits ?? 0,
    uniqueYesterday: y?.uniques ?? 0,
    last7,
    recent: store.recent.slice(0, RECENT_SHOW).map((row) => ({
      at: row.at,
      ip: displayIp(row.ip) || row.ip,
      path: sanitizeVisitPath(row.path),
    })),
    guests,
  };
}
