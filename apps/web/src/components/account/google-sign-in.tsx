"use client";

import { useEffect, useRef, useState } from "react";
import { fetchGoogleAuthConfig } from "@/lib/store-api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (res: { credential: string }) => void }) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (res: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
        };
      };
    };
  }
}

type Props = {
  onToken: (payload: { idToken?: string; accessToken?: string }) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
};

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Không tải được Google.")));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không tải được Google."));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({ onToken, onError, disabled }: Props) {
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  const [busy, setBusy] = useState(false);
  onTokenRef.current = onToken;
  onErrorRef.current = onError;

  useEffect(() => {
    void loadGis().catch(() => undefined);
  }, []);

  async function startGoogle() {
    if (disabled || busy) return;
    setBusy(true);
    try {
      const cfg = await fetchGoogleAuthConfig();
      const clientId = cfg?.clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
      if (!clientId) {
        onErrorRef.current?.(
          "Chưa bật đăng nhập Google. Thêm GOOGLE_CLIENT_ID vào .env trên server rồi restart API.",
        );
        return;
      }
      await loadGis();
      const oauth = window.google?.accounts?.oauth2;
      if (!oauth) throw new Error("Không tải được Google.");
      const client = oauth.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: (res) => {
          if (res.error || !res.access_token) {
            onErrorRef.current?.(res.error_description || "Đã hủy đăng nhập Google.");
            setBusy(false);
            return;
          }
          void Promise.resolve(onTokenRef.current({ accessToken: res.access_token })).finally(() => {
            setBusy(false);
          });
        },
      });
      client.requestAccessToken({ prompt: "select_account" });
    } catch (err) {
      onErrorRef.current?.(err instanceof Error ? err.message : "Không mở được Google.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void startGoogle()}
        disabled={disabled || busy}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#747775] bg-white px-4 py-3 text-sm font-medium text-[#1f1f1f] transition hover:bg-[#f7f8f8] disabled:opacity-60"
      >
        <GoogleMark />
        {busy ? "Đang mở Google…" : "Sign in with Google"}
      </button>
      <p className="text-center text-xs uppercase tracking-wider text-[var(--ink-muted)]">hoặc email</p>
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7 12.9 19.6C14.7 15.2 18.9 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.7 7.5l.1.1 6.3 5.3C36.9 41.9 44 36 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
