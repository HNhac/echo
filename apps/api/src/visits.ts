import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { dataDir } from "./db.js";

export type VisitDay = { date: string; hits: number; uniques: number };

type VisitStore = {
  days: Record<string, { hits: number; uniques: number }>;
  today: { date: string; hits: number; hashes: string[] };
};

const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|preview/i;

function visitsPath() {
  return join(dataDir, "visits.json");
}

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function emptyStore(date = todayKey()): VisitStore {
  return { days: {}, today: { date, hits: 0, hashes: [] } };
}

function loadStore(): VisitStore {
  mkdirSync(dataDir, { recursive: true });
  if (!existsSync(visitsPath())) return emptyStore();
  try {
    const raw = JSON.parse(readFileSync(visitsPath(), "utf8")) as VisitStore;
    if (!raw?.today?.date) return emptyStore();
    if (raw.today.date !== todayKey()) {
      raw.days[raw.today.date] = {
        hits: raw.today.hits,
        uniques: raw.today.hashes.length,
      };
      raw.today = { date: todayKey(), hits: 0, hashes: [] };
      prune(raw);
      saveStore(raw);
    }
    return raw;
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
}

function saveStore(store: VisitStore) {
  writeFileSync(visitsPath(), `${JSON.stringify(store)}\n`);
}

function hashIp(ip: string, date: string) {
  return createHash("sha256").update(`${date}|${ip}`).digest("hex").slice(0, 16);
}

export function clientIp(headers: { get(name: string): string | null | undefined }) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  return forwarded || real || "";
}

export function recordVisit(input: { ip: string; agent?: string }) {
  const agent = input.agent ?? "";
  if (BOT.test(agent)) return { ok: true as const, skipped: "bot" };
  const ip = input.ip || "unknown";
  const store = loadStore();
  const date = todayKey();
  const hash = hashIp(ip, date);
  store.today.hits += 1;
  if (!store.today.hashes.includes(hash)) {
    store.today.hashes.push(hash);
    if (store.today.hashes.length > 20000) store.today.hashes = store.today.hashes.slice(-15000);
  }
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
  return {
    hitsToday: store.today.hits,
    uniqueToday: store.today.hashes.length,
    hitsYesterday: y?.hits ?? 0,
    uniqueYesterday: y?.uniques ?? 0,
    last7,
  };
}
