import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Load repo-root .env / .env.local into process.env (does not override existing vars).
 * Walks up from `fromDir` so Next apps and the API share one file at the monorepo root.
 */
export function loadRootEnv(fromDir) {
  let dir = fromDir;
  for (let i = 0; i < 8; i++) {
    for (const name of [".env.local", ".env"]) {
      const file = join(dir, name);
      if (!existsSync(file)) continue;
      for (const raw of readFileSync(file, "utf8").split("\n")) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq < 1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = value;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

export function isHttpUrl(value) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

/** Server-side / Next rewrite target (loopback or docker service name). */
export function apiOrigin() {
  const internal = process.env.API_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  const raw = internal || (isHttpUrl(pub) ? pub : "http://127.0.0.1:4000");
  return raw.replace(/\/$/, "");
}

export function uploadImageRemotePatterns() {
  const candidates = [
    process.env.NEXT_PUBLIC_API_URL,
    process.env.API_URL,
    "http://127.0.0.1:4000",
    "http://localhost:4000",
  ];
  const seen = new Set();
  const patterns = [];
  for (const raw of candidates) {
    if (!isHttpUrl(raw)) continue;
    try {
      const url = new URL(raw);
      if (seen.has(url.origin)) continue;
      seen.add(url.origin);
      patterns.push({
        protocol: url.protocol === "https:" ? "https" : "http",
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: "/uploads/**",
      });
    } catch {
      /* skip invalid */
    }
  }
  return patterns;
}
