import type { Customer, CreateCustomerInput } from "@echo/shared";
import { isEmail, normalizeEmail } from "@echo/shared";
import { hashPassword, newKey } from "./auth.js";

export function googleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
}

export function buildCustomer(input: CreateCustomerInput & { googleId?: string }): Customer {
  const email = normalizeEmail(input.email);
  return {
    id: `c-${Date.now().toString(36)}-${newKey().slice(0, 6)}`,
    name: input.name.trim(),
    email,
    phone: (input.phone ?? "").trim(),
    address: (input.address ?? "").trim(),
    passwordHash: input.password ? hashPassword(input.password) : undefined,
    googleId: input.googleId,
    key: newKey(),
    createdAt: new Date().toISOString(),
  };
}

export function findCustomerByEmail(customers: Customer[], email: string) {
  const needle = normalizeEmail(email);
  return customers.find((item) => item.email === needle);
}

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile | null> {
  const clientId = googleClientId();
  if (!clientId || !idToken.trim()) return null;
  try {
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      aud?: string;
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
    };
    if (data.aud !== clientId) return null;
    if (!data.sub || !data.email) return null;
    const verified = data.email_verified === true || data.email_verified === "true";
    if (!verified || !isEmail(data.email)) return null;
    return {
      sub: data.sub,
      email: normalizeEmail(data.email),
      name: String(data.name ?? "").trim() || data.email.split("@")[0],
    };
  } catch {
    return null;
  }
}

export async function verifyGoogleAccessToken(accessToken: string): Promise<GoogleProfile | null> {
  const clientId = googleClientId();
  if (!clientId || !accessToken.trim()) return null;
  try {
    const infoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken.trim())}`,
    );
    if (!infoRes.ok) return null;
    const info = (await infoRes.json()) as {
      aud?: string;
      audience?: string;
      azp?: string;
      issued_to?: string;
    };
    const aud = info.aud || info.audience || info.azp || info.issued_to;
    if (aud !== clientId) return null;

    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken.trim()}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
    };
    if (!data.sub || !data.email) return null;
    const verified = data.email_verified === true || data.email_verified === "true";
    if (!verified || !isEmail(data.email)) return null;
    return {
      sub: data.sub,
      email: normalizeEmail(data.email),
      name: String(data.name ?? "").trim() || data.email.split("@")[0],
    };
  } catch {
    return null;
  }
}
