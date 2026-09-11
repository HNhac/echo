import "./env.js";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  permissionsFor,
  type StaffRole,
  type StaffUser,
} from "@echo/shared";

export const ADMIN_KEY = process.env.ADMIN_KEY ?? "echo-admin";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const next = scryptSync(password, salt, 64);
    const prev = Buffer.from(hash, "hex");
    if (prev.length !== next.length) return false;
    return timingSafeEqual(prev, next);
  } catch {
    return false;
  }
}

export function newKey() {
  return randomBytes(24).toString("hex");
}

export function seedOwner(): StaffUser {
  return {
    id: "owner",
    name: "Chủ studio",
    username: "admin",
    passwordHash: hashPassword(ADMIN_KEY),
    role: "owner",
    permissions: permissionsFor("owner"),
    key: ADMIN_KEY,
    createdAt: new Date().toISOString(),
  };
}

export function buildStaff(input: {
  name: string;
  username: string;
  password: string;
  role: StaffRole;
  permissions?: StaffUser["permissions"];
}): StaffUser {
  return {
    id: `u-${Date.now()}`,
    name: input.name.trim(),
    username: input.username,
    passwordHash: hashPassword(input.password),
    role: input.role,
    permissions: permissionsFor(input.role, input.permissions),
    key: newKey(),
    createdAt: new Date().toISOString(),
  };
}
