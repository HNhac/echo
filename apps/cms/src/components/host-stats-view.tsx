"use client";

import { useEffect, useState } from "react";
import { formatBytes, formatUptime, usagePct, type HostStats } from "@echo/shared";
import { API } from "@/lib/api";

type Props = {
  adminKey: string;
};

function Bar({ pct }: { pct: number }) {
  const danger = pct >= 85;
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
}: {
  label: string;
  value: string;
  hint?: string;
  pct?: number;
}) {
  return (
    <article className="host-card">
      <p className="muted tiny">{label}</p>
      <b>{value}</b>
      {hint ? <p className="muted tiny">{hint}</p> : null}
      {pct != null ? <Bar pct={pct} /> : null}
    </article>
  );
}

function isVps(hostname: string, source: string) {
  return source === "file" || /shop-prod|echothuvui|vps/i.test(hostname);
}

export function HostStatsView({ adminKey }: Props) {
  const [stats, setStats] = useState<HostStats | null>(null);
  const [error, setError] = useState("");
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

  if (error && !stats) return <p className="alert">{error}</p>;
  if (!stats) return <p className="hint">Đang đọc VPS…</p>;

  const ramPct = usagePct(stats.ram.used, stats.ram.total);
  const diskPct = usagePct(stats.disk.used, stats.disk.total);
  const when = new Date(stats.collectedAt).toLocaleString("vi-VN");
  const vps = isVps(stats.hostname, stats.source);
  const week = stats.visitors.last7 ?? [];

  return (
    <div className="host-studio">
      {vps ? (
        <p className="hint">
          VPS <b>{stats.hostname}</b> — echothuvui.vn. Giống panel: RAM, ổ, băng thông, khách mỗi ngày.
          {stats.stale ? " Số máy hơi cũ (cron)." : ""} Cập nhật {when}.
        </p>
      ) : (
        <p className="alert">
          Đang xem máy local (<b>{stats.hostname}</b>), không phải VPS. Mở{" "}
          <a href="https://cms.echothuvui.vn/may-chu">cms.echothuvui.vn/may-chu</a> để thấy RAM/disk/khách
          production.
        </p>
      )}
      {error ? <p className="alert">{error}</p> : null}

      <div className="host-grid">
        <Card
          label="Khách hôm nay"
          value={stats.visitors.uniqueToday != null ? String(stats.visitors.uniqueToday) : "—"}
          hint={
            stats.visitors.hitsToday != null
              ? `${stats.visitors.hitsToday} lượt xem trang · hôm qua ${stats.visitors.uniqueYesterday ?? 0} khách`
              : stats.visitors.note
          }
        />
        <Card
          label="Băng thông hôm nay"
          value={stats.traffic ? formatBytes(stats.traffic.todayRx + stats.traffic.todayTx) : "—"}
          hint={
            stats.traffic
              ? `Vào ${formatBytes(stats.traffic.todayRx)} · ra ${formatBytes(stats.traffic.todayTx)}`
              : "Cần cron trên VPS"
          }
        />
        <Card
          label="Băng thông tháng này"
          value={stats.traffic ? formatBytes(stats.traffic.monthRx + stats.traffic.monthTx) : "—"}
          hint={stats.traffic ? `${stats.traffic.iface} · cộng dồn từ lúc bật đếm` : "—"}
        />
        <Card
          label="Ổ đĩa VPS"
          value={`${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`}
          hint={`Còn ${formatBytes(stats.disk.available)} · ${diskPct.toFixed(0)}%`}
          pct={diskPct}
        />
        <Card
          label="RAM VPS"
          value={`${formatBytes(stats.ram.used)} / ${formatBytes(stats.ram.total)}`}
          hint={`Còn ${formatBytes(stats.ram.available)} · ${ramPct.toFixed(0)}%`}
          pct={ramPct}
        />
        <Card
          label="CPU / uptime"
          value={`${stats.cpuCount} nhân · ${formatUptime(stats.uptimeSec)}`}
          hint={`Load ${stats.load.map((n) => n.toFixed(2)).join(" · ")}`}
          pct={Math.min(100, (stats.load[0] / Math.max(1, stats.cpuCount)) * 100)}
        />
      </div>

      <section className="host-box">
        <header>
          <p className="field-label">Khách echothuvui.vn 7 ngày</p>
          <p className="muted tiny">Mỗi người (IP) đếm 1 lần/ngày. Mỗi trang xem là 1 lượt.</p>
        </header>
        {week.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khách</th>
                  <th>Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {week.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.uniques}</td>
                    <td>{row.hits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted tiny">Chưa có lượt vào — số bắt đầu đếm sau khi deploy shop.</p>
        )}
      </section>

      <section className="host-box">
        <header>
          <p className="field-label">Docker</p>
          <p className="muted tiny">App trên VPS.</p>
        </header>
        {stats.containers.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>App</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Mạng</th>
                </tr>
              </thead>
              <tbody>
                {stats.containers.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.cpu}</td>
                    <td>
                      {row.memory} <span className="muted tiny">{row.memPct}</span>
                    </td>
                    <td>{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted tiny">Chưa thấy Docker trên máy này.</p>
        )}
      </section>
    </div>
  );
}
