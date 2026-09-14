"use client";

import { useEffect, useState } from "react";
import { formatBytes, formatUptime, usagePct, type HostGuestStat, type HostRecentVisit, type HostStats } from "@echo/shared";
import { API } from "@/lib/api";
import { shopOrigin } from "@/lib/shop";

type Props = {
  adminKey: string;
};

function Bar({ pct, hot }: { pct: number; hot?: boolean }) {
  const danger = hot ?? pct >= 85;
  return (
    <div className="host-bar" aria-hidden>
      <i style={{ width: `${Math.min(100, pct)}%` }} className={danger ? "is-hot" : undefined} />
    </div>
  );
}

function Card({
  label,
  value,
  hint,
  pct,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  pct?: number;
  tone?: "sage" | "sky" | "gold" | "accent";
}) {
  return (
    <article className={`host-card${tone ? ` host-card--${tone}` : ""}`}>
      <p className="muted tiny">{label}</p>
      <b>{value}</b>
      {hint ? <p className="muted tiny">{hint}</p> : null}
      {pct != null ? <Bar pct={pct} hot={tone === "accent" ? pct >= 85 : undefined} /> : null}
    </article>
  );
}

function isVps(hostname: string, source: string) {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return false;
    if (/echothuvui/i.test(host)) return true;
  }
  return source === "file" || /shop-prod|echothuvui|vps/i.test(hostname);
}

function niceIp(ip?: string) {
  const raw = (ip ?? "").trim();
  if (!raw || raw === "unknown") return "";
  return raw.startsWith("::ffff:") ? raw.slice(7) : raw;
}

function pageName(path: string) {
  const raw = path || "/";
  if (raw === "/") return "Trang chủ";
  if (raw === "/san-pham") return "Cửa hàng";
  if (raw.startsWith("/san-pham/")) return "Sản phẩm";
  if (raw === "/gio-hang") return "Giỏ hàng";
  if (raw === "/thanh-toan") return "Thanh toán";
  if (raw.startsWith("/tai-khoan")) return "Tài khoản";
  if (raw === "/bo-suu-tap") return "Bộ sưu tập";
  if (raw === "/cau-chuyen") return "Câu chuyện";
  try {
    return decodeURIComponent(raw).replace(/^\//, "");
  } catch {
    return raw;
  }
}

function pageSlug(path: string) {
  if (!path.startsWith("/san-pham/")) return "";
  try {
    return decodeURIComponent(path.slice("/san-pham/".length));
  } catch {
    return path.slice("/san-pham/".length);
  }
}

function pageLine(path: string) {
  const slug = pageSlug(path);
  return slug ? `${pageName(path)} · ${slug}` : pageName(path);
}

function guestsFromRecent(recent: HostRecentVisit[]): HostGuestStat[] {
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map<
    string,
    { ip: string; hits: number; todayHits: number; lastAt: string; lastPath: string; pages: Record<string, number> }
  >();
  for (const row of recent) {
    const ip = niceIp(row.ip) || "unknown";
    const path = row.path || "/";
    const cur = map.get(ip);
    const isToday = row.at.slice(0, 10) === today;
    if (!cur) {
      map.set(ip, {
        ip,
        hits: 1,
        todayHits: isToday ? 1 : 0,
        lastAt: row.at,
        lastPath: path,
        pages: { [path]: 1 },
      });
      continue;
    }
    cur.hits += 1;
    if (isToday) cur.todayHits += 1;
    cur.pages[path] = (cur.pages[path] ?? 0) + 1;
    if (row.at > cur.lastAt) {
      cur.lastAt = row.at;
      cur.lastPath = path;
    }
  }
  return [...map.values()]
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .map((guest) => ({
      ip: guest.ip,
      hits: guest.hits,
      todayHits: guest.todayHits,
      lastAt: guest.lastAt,
      lastPath: guest.lastPath,
      pages: Object.entries(guest.pages)
        .map(([path, hits]) => ({ path, hits }))
        .sort((a, b) => b.hits - a.hits),
    }));
}

function ago(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(iso).toLocaleString("vi-VN");
}

function lastSeen(iso: string) {
  const at = new Date(iso);
  if (!Number.isFinite(at.getTime())) return { rel: "", clock: "" };
  return {
    rel: ago(iso),
    clock: at.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }),
  };
}

function weekdayVi(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("vi-VN", { weekday: "short" });
}

function dayNum(date: string) {
  return String(new Date(`${date}T12:00:00`).getDate()).padStart(2, "0");
}

function ipTail(ip: string) {
  if (ip.includes(".")) return ip.split(".").pop() || "?";
  return ip.replace(/:/g, "").slice(-3) || "?";
}

function smoothLine(points: Array<[number, number]>) {
  if (!points.length) return "";
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function WeekChart({ week }: { week: Array<{ date: string; hits: number; uniques: number }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...week.map((row) => Math.max(row.hits, row.uniques)));
  const W = 720;
  const H = 248;
  const L = 18;
  const R = 18;
  const T = 28;
  const B = 46;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const last = week.length - 1;
  const xs = week.map((_, i) => (week.length < 2 ? L + plotW / 2 : L + (i * plotW) / (week.length - 1)));
  const yOf = (n: number) => T + plotH * (1 - n / max);
  const hitsPts = week.map((row, i) => [xs[i], yOf(row.hits)] as [number, number]);
  const uniPts = week.map((row, i) => [xs[i], yOf(row.uniques)] as [number, number]);
  const hitsLine = smoothLine(hitsPts);
  const uniLine = smoothLine(uniPts);
  const hitsArea =
    hitsPts.length > 1
      ? `${hitsLine} L ${xs[last]} ${T + plotH} L ${xs[0]} ${T + plotH} Z`
      : "";
  const active = hover ?? last;
  const activeRow = week[active];

  return (
    <figure className="host-chart">
      <div className="host-chart__legend">
        <span className="host-chart__key is-hits">Lượt xem</span>
        <span className="host-chart__key is-uni">Khách</span>
        {activeRow ? (
          <b>
            {weekdayVi(activeRow.date)} {dayNum(activeRow.date)} · {activeRow.uniques} khách · {activeRow.hits} lượt
          </b>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Biểu đồ khách 7 ngày"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="hostHitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            className="host-chart__grid"
            x1={L}
            x2={W - R}
            y1={T + plotH * (1 - t)}
            y2={T + plotH * (1 - t)}
          />
        ))}
        <line className="host-chart__base" x1={L} x2={W - R} y1={T + plotH} y2={T + plotH} />
        {hitsArea ? <path className="host-chart__area" d={hitsArea} fill="url(#hostHitsFill)" /> : null}
        <path className="host-chart__line is-hits" d={hitsLine} />
        <path className="host-chart__line is-uni" d={uniLine} />
        {week.map((row, i) => (
          <g key={row.date} className={i === active ? "is-on" : undefined}>
            <rect
              className="host-chart__hit"
              x={xs[i] - plotW / 14}
              y={T}
              width={plotW / 7}
              height={plotH + 8}
              onMouseEnter={() => setHover(i)}
            />
            <circle className="host-chart__dot is-hits" cx={xs[i]} cy={yOf(row.hits)} r={i === active ? 6 : 4.5} />
            <circle className="host-chart__dot is-uni" cx={xs[i]} cy={yOf(row.uniques)} r={i === active ? 6 : 4.5} />
            <text className="host-chart__wd" x={xs[i]} y={H - 22}>
              {weekdayVi(row.date)}
            </text>
            <text className="host-chart__dn" x={xs[i]} y={H - 8}>
              {dayNum(row.date)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

function appLabel(name: string) {
  return name.replace(/^echo-/, "").replace(/-\d+$/, "");
}

function lanShopUrl(ip: string) {
  if (typeof window === "undefined") return `http://${ip}:3010`;
  const { protocol, port } = window.location;
  const shopPort = port === "3011" ? "3010" : port === "3001" ? "3000" : "3010";
  const host = ip.includes(":") ? `[${ip}]` : ip;
  return `${protocol}//${host}:${shopPort}`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function HostStatsView({ adminKey }: Props) {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${API}/admin/host-stats`, {
          cache: "no-store",
          headers: { "x-admin-key": adminKey },
        });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data.error ?? "Không đọc được máy chủ.");
          return;
        }
        setStats(data as HostStats);
        setError("");
      } catch {
        if (alive) setError("Không kết nối được API.");
      }
    }
    void load();
    const id = window.setInterval(() => void load(), 20_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [adminKey]);

  const origin = shopOrigin();
  const week = stats?.visitors.last7 ?? [];
  const guests = stats?.visitors.guests?.length
    ? stats.visitors.guests
    : guestsFromRecent(stats?.visitors.recent ?? []);
  const latest = guests[0];
  const latestIp = niceIp(latest?.ip);

  async function copy(label: string, value: string) {
    if (!value) return;
    const ok = await copyText(value);
    setCopied(ok ? label : "");
    window.setTimeout(() => setCopied(""), 1600);
  }

  if (error && !stats) return <p className="alert">{error}</p>;
  if (!stats) return <p className="hint">Đang đọc máy chủ…</p>;

  const ramPct = usagePct(stats.ram.used, stats.ram.total);
  const diskPct = usagePct(stats.disk.used, stats.disk.total);
  const cpuPct = Math.min(100, (stats.load[0] / Math.max(1, stats.cpuCount)) * 100);
  const when = new Date(stats.collectedAt).toLocaleString("vi-VN");
  const vps = isVps(stats.hostname, stats.source);
  const host = stats.publicHost || "echothuvui.vn";
  const shopUrl = vps ? `https://${host}` : origin;
  const cmsUrl = vps ? `https://cms.${host}` : origin.replace(/:\d+$/, (p) => (p === ":3010" ? ":3011" : p === ":3000" ? ":3001" : p));
  const publicIp = niceIp(stats.publicIp);
  const lanIp = (stats.lanIps ?? []).map(niceIp).find(Boolean) ?? "";
  const phoneUrl = !vps && lanIp ? lanShopUrl(lanIp) : shopUrl;

  return (
    <div className="host-studio">
      <section className={`host-hero${vps ? " is-live" : ""}`}>
        <div className="host-hero__main">
          <p className="host-pill">{vps ? "VPS production" : "Máy local"}</p>
          <h2>{stats.hostname}</h2>
          <p className="muted tiny">
            {vps ? `${host} · cập nhật ${when}` : `Không phải VPS · cập nhật ${when}`}
            {stats.stale ? " · số máy hơi cũ (cron)" : ""}
            {publicIp ? ` · máy ${publicIp}` : lanIp ? ` · LAN ${lanIp}` : ""}
          </p>
          <div className="host-hero__links">
            <a href={shopUrl} target="_blank" rel="noreferrer">
              Mở shop
            </a>
            {vps ? (
              <a href={cmsUrl} target="_blank" rel="noreferrer">
                CMS
              </a>
            ) : null}
            {!vps && lanIp ? (
              <a href={phoneUrl} target="_blank" rel="noreferrer">
                Mở bằng IP LAN
              </a>
            ) : null}
          </div>
        </div>
        <div className="host-hero__ip">
          <p className="muted tiny">Khách vừa xem</p>
          <code>{latestIp || "—"}</code>
          {latest ? (
            <p className="muted tiny">
              {latest.hits} lần · {pageLine(latest.lastPath)} · {ago(latest.lastAt)}
            </p>
          ) : (
            <p className="muted tiny">Chưa có khách mở shop.</p>
          )}
          <div className="host-hero__ip-actions">
            <button type="button" className="ghost" disabled={!latestIp} onClick={() => void copy("latest", latestIp)}>
              {copied === "latest" ? "Đã copy" : "Copy IP"}
            </button>
            {latest ? (
              <a className="ghost" href={`${origin}${latest.lastPath || "/"}`} target="_blank" rel="noreferrer">
                Xem trang
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {!vps ? (
        <p className="alert">
          Đang xem máy local. Mở{" "}
          <a href="https://cms.echothuvui.vn/may-chu">cms.echothuvui.vn/may-chu</a> để thấy RAM/disk/khách
          production.
        </p>
      ) : null}
      {error ? <p className="alert">{error}</p> : null}

      <div className="host-grid">
        <Card
          tone="accent"
          label="Khách hôm nay"
          value={stats.visitors.uniqueToday != null ? String(stats.visitors.uniqueToday) : "—"}
          hint={
            stats.visitors.hitsToday != null
              ? `${stats.visitors.hitsToday} lượt xem · hôm qua ${stats.visitors.uniqueYesterday ?? 0} khách`
              : stats.visitors.note
          }
        />
        <Card
          tone="sky"
          label="Băng thông hôm nay"
          value={stats.traffic ? formatBytes(stats.traffic.todayRx + stats.traffic.todayTx) : "—"}
          hint={
            stats.traffic
              ? `Vào ${formatBytes(stats.traffic.todayRx)} · ra ${formatBytes(stats.traffic.todayTx)}`
              : "Cần cron trên VPS"
          }
        />
        <Card
          tone="sky"
          label="Băng thông tháng"
          value={stats.traffic ? formatBytes(stats.traffic.monthRx + stats.traffic.monthTx) : "—"}
          hint={stats.traffic ? `${stats.traffic.iface} · cộng dồn từ lúc bật đếm` : "—"}
        />
        <Card
          tone={diskPct >= 85 ? "accent" : "gold"}
          label="Ổ đĩa"
          value={`${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`}
          hint={`Còn ${formatBytes(stats.disk.available)} · ${diskPct.toFixed(0)}%`}
          pct={diskPct}
        />
        <Card
          tone={ramPct >= 85 ? "accent" : "sage"}
          label="RAM"
          value={`${formatBytes(stats.ram.used)} / ${formatBytes(stats.ram.total)}`}
          hint={`Còn ${formatBytes(stats.ram.available)} · ${ramPct.toFixed(0)}%`}
          pct={ramPct}
        />
        <Card
          tone="sage"
          label="CPU / uptime"
          value={`${stats.cpuCount} nhân · ${formatUptime(stats.uptimeSec)}`}
          hint={`Load ${stats.load.map((n) => n.toFixed(2)).join(" · ")}`}
          pct={cpuPct}
        />
      </div>

      <div className="host-split">
        <section className="host-box host-box--chart">
          <header>
            <p className="field-label">Khách 7 ngày</p>
            <p className="muted tiny">Đường hồng là lượt xem trang. Đường xanh là số khách.</p>
          </header>
          {week.length ? <WeekChart week={week} /> : <p className="muted tiny">Chưa có lượt vào.</p>}
        </section>

        <section className="host-box">
          <header>
            <p className="field-label">Docker</p>
            <p className="muted tiny">{vps ? "App đang chạy trên VPS." : "Container trên máy này."}</p>
          </header>
          {stats.containers.length ? (
            <ul className="host-dock">
              {stats.containers.map((row) => (
                <li key={row.name}>
                  <div>
                    <strong>{appLabel(row.name)}</strong>
                    <span className="muted tiny">{row.name}</span>
                  </div>
                  <div className="host-dock__meta">
                    <span>CPU {row.cpu}</span>
                    <span>
                      RAM {row.memory} <em>{row.memPct}</em>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted tiny">Chưa thấy Docker trên máy này.</p>
          )}
        </section>
      </div>

      <section className="host-box">
        <header className="host-box__head">
          <div>
            <p className="field-label">Khách xem web</p>
            <p className="muted tiny">Mỗi khách một dòng: số lần xem, trang đã vào, và thời gian xem gần nhất.</p>
          </div>
          {guests.length ? <span className="host-pill">{guests.length} khách</span> : null}
        </header>
        {guests.length ? (
          <div className="table-wrap host-visits">
            <table className="table">
              <thead>
                <tr>
                  <th>Khách</th>
                  <th>Lần xem</th>
                  <th>Hôm nay</th>
                  <th>Xem gần nhất</th>
                  <th>Trang vừa xem</th>
                  <th>Trang đã vào</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {guests.map((guest) => {
                  const ip = niceIp(guest.ip);
                  const href = `${origin}${guest.lastPath || "/"}`;
                  const key = guest.ip;
                  const seen = lastSeen(guest.lastAt);
                  return (
                    <tr key={key}>
                      <td>
                        <div className="host-guest">
                          <span className="host-ips__mark" aria-hidden>
                            {ipTail(ip || "?")}
                          </span>
                          <code className="host-ip">{ip || "—"}</code>
                        </div>
                      </td>
                      <td>
                        <strong>{guest.hits}</strong>
                        <p className="muted tiny">{guest.hits === 1 ? "lần" : "lần xem"}</p>
                      </td>
                      <td>{guest.todayHits}</td>
                      <td>
                        <strong>{seen.rel}</strong>
                        <p className="muted tiny">{seen.clock}</p>
                      </td>
                      <td>
                        <a className="host-path" href={href} target="_blank" rel="noreferrer">
                          {pageLine(guest.lastPath)}
                        </a>
                      </td>
                      <td>
                        <div className="host-pages">
                          {guest.pages.map((page) => (
                            <span key={page.path}>
                              {pageLine(page.path)} <em>×{page.hits}</em>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="ghost" disabled={!ip} onClick={() => void copy(key, ip)}>
                            {copied === key ? "Đã copy" : "Copy IP"}
                          </button>
                          <a className="ghost" href={href} target="_blank" rel="noreferrer">
                            Xem trang
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted tiny">Chưa có khách — mở shop một lần rồi quay lại đây.</p>
        )}
      </section>
    </div>
  );
}
