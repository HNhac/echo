#!/usr/bin/env python3
"""Host RAM/disk/bandwidth for CMS. Run on the VPS host, not inside Docker."""
from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(os.environ.get("HOST_STATS_FILE", ROOT / "var" / "host-stats.json"))
COUNTER = OUT.parent / "net-counters.json"


def sh(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, text=True, timeout=8).strip()
    except Exception:
        return ""


def meminfo() -> dict:
    total = avail = 0
    try:
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemTotal:"):
                total = int(line.split()[1]) * 1024
            elif line.startswith("MemAvailable:"):
                avail = int(line.split()[1]) * 1024
    except Exception:
        pass
    return {"total": total, "used": max(0, total - avail), "available": avail}


def loadavg() -> list[float]:
    try:
        a, b, c = Path("/proc/loadavg").read_text().split()[:3]
        return [round(float(a), 2), round(float(b), 2), round(float(c), 2)]
    except Exception:
        return [0, 0, 0]


def cpu_count() -> int:
    try:
        return sum(1 for line in Path("/proc/cpuinfo").read_text().splitlines() if line.startswith("processor"))
    except Exception:
        return os.cpu_count() or 1


def uptime_sec() -> int:
    try:
        return int(float(Path("/proc/uptime").read_text().split()[0]))
    except Exception:
        return 0


def disk() -> dict:
    out = sh(["df", "-kP", "/"])
    lines = [ln for ln in out.splitlines() if ln.startswith("/")]
    parts = (lines[0] if lines else "").split()
    if len(parts) < 6:
        return {"total": 0, "used": 0, "available": 0, "mount": "/"}
    return {
        "total": int(parts[1]) * 1024,
        "used": int(parts[2]) * 1024,
        "available": int(parts[3]) * 1024,
        "mount": parts[5],
    }


def net_dev() -> dict | None:
    try:
        rows = []
        for line in Path("/proc/net/dev").read_text().splitlines():
            line = line.strip()
            if ":" not in line or line.startswith("lo:"):
                continue
            name, rest = line.split(":", 1)
            cols = rest.split()
            rows.append((name.strip(), int(cols[0]), int(cols[8])))
        pick = next((r for r in rows if re.match(r"^(eth0|ens|enp|en0)", r[0])), rows[0] if rows else None)
        if not pick:
            return None
        return {"iface": pick[0], "rx": pick[1], "tx": pick[2]}
    except Exception:
        return None


def traffic(net: dict | None) -> dict | None:
    if not net:
        return None
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    month = day[:7]
    prev = {
        "day": day,
        "month": month,
        "snapRx": net["rx"],
        "snapTx": net["tx"],
        "dayRx": 0,
        "dayTx": 0,
        "monthRx": 0,
        "monthTx": 0,
    }
    if COUNTER.exists():
        try:
            prev.update(json.loads(COUNTER.read_text()))
        except Exception:
            pass
    d_rx = net["rx"] - int(prev.get("snapRx") or 0)
    d_tx = net["tx"] - int(prev.get("snapTx") or 0)
    if d_rx < 0 or d_rx > 50 * 1024 * 1024 * 1024:
        d_rx = 0
    if d_tx < 0 or d_tx > 50 * 1024 * 1024 * 1024:
        d_tx = 0
    if prev.get("day") != day:
        prev["day"] = day
        prev["dayRx"] = 0
        prev["dayTx"] = 0
    if prev.get("month") != month:
        prev["month"] = month
        prev["monthRx"] = 0
        prev["monthTx"] = 0
    prev["dayRx"] = int(prev.get("dayRx") or 0) + d_rx
    prev["dayTx"] = int(prev.get("dayTx") or 0) + d_tx
    prev["monthRx"] = int(prev.get("monthRx") or 0) + d_rx
    prev["monthTx"] = int(prev.get("monthTx") or 0) + d_tx
    prev["snapRx"] = net["rx"]
    prev["snapTx"] = net["tx"]
    COUNTER.parent.mkdir(parents=True, exist_ok=True)
    COUNTER.write_text(json.dumps(prev) + "\n")
    return {
        "iface": net["iface"],
        "todayRx": prev["dayRx"],
        "todayTx": prev["dayTx"],
        "monthRx": prev["monthRx"],
        "monthTx": prev["monthTx"],
    }


def public_ip() -> str:
    env = os.environ.get("PUBLIC_IP", "").strip()
    if env:
        return env
    ips = [ip for ip in sh(["hostname", "-I"]).split() if ip]
    for ip in ips:
        if not re.match(r"^(10\.|127\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.)", ip):
            return ip
    return ips[0] if ips else ""


def docker_stats() -> list:
    out = sh(
        [
            "docker",
            "stats",
            "--no-stream",
            "--format",
            "{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}",
        ]
    )
    rows = []
    for line in out.splitlines():
        cols = line.split("\t")
        if len(cols) < 5:
            continue
        rows.append({"name": cols[0], "cpu": cols[1], "memory": cols[2], "memPct": cols[3], "net": cols[4]})
    return rows


def main() -> None:
    net = net_dev()
    lan = [ip for ip in sh(["hostname", "-I"]).split() if ip]
    stats = {
        "collectedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
        "source": "file",
        "hostname": os.uname().nodename,
        "publicIp": public_ip(),
        "publicHost": os.environ.get("PUBLIC_HOST", "").strip(),
        "lanIps": lan,
        "uptimeSec": uptime_sec(),
        "cpuCount": cpu_count(),
        "load": loadavg(),
        "ram": meminfo(),
        "disk": disk(),
        "net": net,
        "traffic": traffic(net),
        "containers": docker_stats(),
        "visitors": {"hitsToday": None, "uniqueToday": None},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(stats, indent=2) + "\n")


if __name__ == "__main__":
    main()
