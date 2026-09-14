import { execFile } from "node:child_process";
import { lookup } from "node:dns/promises";
import { existsSync, readFileSync } from "node:fs";
import { cpus, freemem, hostname, loadavg, networkInterfaces, totalmem, uptime } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { HostContainerStat, HostStats, HostVisitorStat } from "@echo/shared";
import { dataDir } from "./db.js";
import { visitSummary } from "./visits.js";

const exec = promisify(execFile);

function statsPath() {
  return (
    process.env.HOST_STATS_FILE?.trim() ||
    join(dataDir, "..", "..", "..", "var", "host-stats.json")
  );
}

function parseIntSafe(value: string) {
  const n = Number.parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

async function sh(cmd: string, args: string[]) {
  try {
    const { stdout } = await exec(cmd, args, { timeout: 8000 });
    return stdout.trim();
  } catch {
    return "";
  }
}

function diskFromDf(text: string) {
  const line = text.split("\n").find((row) => row.startsWith("/")) ?? text.split("\n")[1] ?? "";
  const parts = line.split(/\s+/);
  const total = parseIntSafe(parts[1] ?? "") * 1024;
  const used = parseIntSafe(parts[2] ?? "") * 1024;
  const available = parseIntSafe(parts[3] ?? "") * 1024;
  return { total, used, available, mount: parts[5] || "/" };
}

function netFromProc() {
  try {
    const raw = readFileSync("/proc/net/dev", "utf8");
    const rows = raw
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.includes(":") && !line.startsWith("lo:"));
    const prefer = rows.find((line) => /^(eth0|ens|enp|en0)/.test(line)) ?? rows[0];
    if (!prefer) return undefined;
    const [iface, rest] = prefer.split(":");
    const cols = rest.trim().split(/\s+/);
    return { iface: iface.trim(), rx: Number(cols[0] || 0), tx: Number(cols[8] || 0) };
  } catch {
    return undefined;
  }
}

async function dockerStats(): Promise<HostContainerStat[]> {
  const out = await sh("docker", [
    "stats",
    "--no-stream",
    "--format",
    "{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}",
  ]);
  if (!out) return [];
  return out
    .split("\n")
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 5)
    .map(([name, cpu, memory, memPct, net]) => ({ name, cpu, memory, memPct, net }));
}

function nginxDateToken(d = new Date()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${months[d.getMonth()]}/${d.getFullYear()}`;
}

function visitorsFromLog(file: string): HostVisitorStat | null {
  if (!existsSync(file)) return null;
  try {
    const token = nginxDateToken();
    const lines = readFileSync(file, "utf8").split("\n");
    const today = lines.filter((line) => line.includes(token));
    const ips = new Set<string>();
    for (const line of today) {
      const ip = line.split(" ")[0];
      if (ip) ips.add(ip);
    }
    return { hitsToday: today.length, uniqueToday: ips.size };
  } catch {
    return null;
  }
}

export function collectLiveStats(): Promise<HostStats> {
  return collectLive();
}

function ramFromProc() {
  try {
    const raw = readFileSync("/proc/meminfo", "utf8");
    const map: Record<string, number> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^(\w+):\s+(\d+)/);
      if (m) map[m[1]] = Number(m[2]) * 1024;
    }
    if (map.MemTotal && map.MemAvailable) {
      return { total: map.MemTotal, used: map.MemTotal - map.MemAvailable, available: map.MemAvailable };
    }
  } catch {
    /* macos */
  }
  const total = totalmem();
  const available = freemem();
  return { total, used: total - available, available };
}

function lanIps() {
  const out: string[] = [];
  for (const rows of Object.values(networkInterfaces())) {
    for (const row of rows ?? []) {
      const family = String(row.family);
      if (row.internal) continue;
      if (family !== "IPv4" && family !== "4") continue;
      if (!out.includes(row.address)) out.push(row.address);
    }
  }
  return out;
}

function isPrivateIp(ip: string) {
  return /^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)/.test(ip);
}

function pickLanIp(candidates: string[]) {
  return candidates.find((ip) => !isPrivateIp(ip)) || candidates[0] || "";
}

async function publicAddress(opts: { fromFile?: string; source: "live" | "file" }) {
  const env = process.env.PUBLIC_IP?.trim();
  if (env) return env;
  if (opts.fromFile?.trim()) return opts.fromFile.trim();
  if (opts.source === "file") {
    const host = process.env.PUBLIC_HOST?.trim();
    if (host && !/localhost/i.test(host)) {
      try {
        return (await lookup(host, { family: 4 })).address;
      } catch {
        /* local DNS */
      }
    }
  }
  return pickLanIp(lanIps());
}

async function collectLive(): Promise<HostStats> {
  const df = await sh("df", ["-kP", "/"]);
  const visitors =
    visitorsFromLog("/var/log/nginx/access.log") ??
    visitorsFromLog("/var/log/nginx/access.log.1") ?? {
      hitsToday: null,
      uniqueToday: null,
      note: "Log nginx không đọc được — user deploy chưa có quyền.",
    };
  const ips = lanIps();

  return {
    collectedAt: new Date().toISOString(),
    source: "live",
    hostname: hostname(),
    publicIp: await publicAddress({ source: "live" }),
    publicHost: process.env.PUBLIC_HOST?.trim() || "",
    lanIps: ips,
    uptimeSec: Math.round(uptime()),
    cpuCount: cpus().length,
    load: loadavg().map((n) => Math.round(n * 100) / 100),
    ram: ramFromProc(),
    disk: df ? diskFromDf(df) : { total: 0, used: 0, available: 0, mount: "/" },
    net: netFromProc(),
    containers: await dockerStats(),
    visitors,
  };
}

export async function readHostStats(): Promise<HostStats> {
  const file = statsPath();
  let base: HostStats | null = null;
  if (existsSync(file)) {
    try {
      const raw = JSON.parse(readFileSync(file, "utf8")) as HostStats;
      const age = Date.now() - new Date(raw.collectedAt).getTime();
      if (Number.isFinite(age) && age >= 0) {
        base = { ...raw, source: "file", stale: age >= 180_000 };
      }
    } catch {
      /* fall through */
    }
  }
  if (!base) base = await collectLive();
  const shop = visitSummary();
  const ips = lanIps();
  return {
    ...base,
    publicIp: await publicAddress({ fromFile: base.publicIp, source: base.source }),
    publicHost: process.env.PUBLIC_HOST?.trim() || base.publicHost || "",
    lanIps: ips.length ? ips : base.lanIps,
    visitors: {
      hitsToday: shop.hitsToday,
      uniqueToday: shop.uniqueToday,
      hitsYesterday: shop.hitsYesterday,
      uniqueYesterday: shop.uniqueYesterday,
      last7: shop.last7,
      recent: shop.recent,
      guests: shop.guests,
      note: "Khách shop (không tính bot).",
    },
  };
}
