export type HostContainerStat = {
  name: string;
  cpu: string;
  memory: string;
  memPct: string;
  net: string;
};

export type HostVisitorStat = {
  hitsToday: number | null;
  uniqueToday: number | null;
  hitsYesterday?: number | null;
  uniqueYesterday?: number | null;
  last7?: Array<{ date: string; hits: number; uniques: number }>;
  note?: string;
};

export type HostTrafficStat = {
  iface: string;
  todayRx: number;
  todayTx: number;
  monthRx: number;
  monthTx: number;
};

export type HostStats = {
  collectedAt: string;
  source: "live" | "file";
  stale?: boolean;
  hostname: string;
  uptimeSec: number;
  cpuCount: number;
  load: number[];
  ram: { total: number; used: number; available: number };
  disk: { total: number; used: number; available: number; mount: string };
  net?: { iface: string; rx: number; tx: number };
  traffic?: HostTrafficStat;
  containers: HostContainerStat[];
  visitors: HostVisitorStat;
};

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  const digits = n >= 10 || i === 0 ? 0 : 1;
  return `${n.toFixed(digits)} ${units[i]}`;
}

export function formatUptime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "—";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d) return `${d} ngày ${h} giờ`;
  if (h) return `${h} giờ ${m} phút`;
  return `${m} phút`;
}

export function usagePct(used: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (used / total) * 100));
}
