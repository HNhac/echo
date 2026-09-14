#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus, freemem, hostname, loadavg, totalmem, uptime } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = process.env.HOST_STATS_FILE || join(root, "var", "host-stats.json");

function sh(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: "utf8", timeout: 8000 }).trim();
  } catch {
    return "";
  }
}

function parseIntSafe(value) {
  const n = Number.parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function diskFromDf(text) {
  const line = text.split("\n").find((row) => row.startsWith("/")) ?? text.split("\n")[1] ?? "";
  const parts = line.split(/\s+/);
  return {
    total: parseIntSafe(parts[1]) * 1024,
    used: parseIntSafe(parts[2]) * 1024,
    available: parseIntSafe(parts[3]) * 1024,
    mount: parts[5] || "/",
  };
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

function dockerStats() {
  const out = sh("docker", [
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
  return `${String(d.getDate()).padStart(2, "0")}/${months[d.getMonth()]}/${d.getFullYear()}`;
}

function visitorsFromLog(file) {
  if (!existsSync(file)) return null;
  try {
    const token = nginxDateToken();
    const today = readFileSync(file, "utf8").split("\n").filter((line) => line.includes(token));
    const ips = new Set(today.map((line) => line.split(" ")[0]).filter(Boolean));
    return { hitsToday: today.length, uniqueToday: ips.size };
  } catch {
    return null;
  }
}

function ramFromProc() {
  try {
    const raw = readFileSync("/proc/meminfo", "utf8");
    const map = {};
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
function trafficFromNet(net) {
  if (!net) return undefined;
  const counterFile = join(dirname(outFile), "net-counters.json");
  const day = new Date().toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  let prev = { day, month, snapRx: net.rx, snapTx: net.tx, dayRx: 0, dayTx: 0, monthRx: 0, monthTx: 0 };
  try {
    if (existsSync(counterFile)) prev = { ...prev, ...JSON.parse(readFileSync(counterFile, "utf8")) };
  } catch {
    /* start fresh */
  }
  let dRx = net.rx - Number(prev.snapRx || 0);
  let dTx = net.tx - Number(prev.snapTx || 0);
  if (dRx < 0 || dRx > 50 * 1024 * 1024 * 1024) dRx = 0;
  if (dTx < 0 || dTx > 50 * 1024 * 1024 * 1024) dTx = 0;
  if (prev.day !== day) {
    prev.day = day;
    prev.dayRx = 0;
    prev.dayTx = 0;
  }
  if (prev.month !== month) {
    prev.month = month;
    prev.monthRx = 0;
    prev.monthTx = 0;
  }
  prev.dayRx += dRx;
  prev.dayTx += dTx;
  prev.monthRx += dRx;
  prev.monthTx += dTx;
  prev.snapRx = net.rx;
  prev.snapTx = net.tx;
  mkdirSync(dirname(counterFile), { recursive: true });
  writeFileSync(counterFile, `${JSON.stringify(prev)}\n`);
  return {
    iface: net.iface,
    todayRx: prev.dayRx,
    todayTx: prev.dayTx,
    monthRx: prev.monthRx,
    monthTx: prev.monthTx,
  };
}

const net = netFromProc();
const df = sh("df", ["-kP", "/"]);
const visitors =
  visitorsFromLog("/var/log/nginx/access.log") ??
  visitorsFromLog("/var/log/nginx/access.log.1") ?? {
    hitsToday: null,
    uniqueToday: null,
    note: "Khách web do shop đếm; log nginx không đọc được.",
  };

const stats = {
  collectedAt: new Date().toISOString(),
  source: "file",
  hostname: hostname(),
  uptimeSec: Math.round(uptime()),
  cpuCount: cpus().length,
  load: loadavg().map((n) => Math.round(n * 100) / 100),
  ram: ramFromProc(),
  disk: df ? diskFromDf(df) : { total: 0, used: 0, available: 0, mount: "/" },
  net,
  traffic: trafficFromNet(net),
  containers: dockerStats(),
  visitors,
};

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(stats, null, 2)}\n`);
if (process.argv.includes("--stdout")) process.stdout.write(`${JSON.stringify(stats)}\n`);
