"use client";

import { useCallback, useState } from "react";
import { ShopLink as Link } from "@/components/store/shop-link";
import { GoogleSignInButton } from "@/components/account/google-sign-in";
import { useCustomer } from "@/components/account/customer-provider";
import { cn } from "@/lib/utils";

export function AccountAuth() {
  const { login, register, loginGoogle } = useCustomer();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onGoogle = useCallback(
    async (payload: { idToken?: string; accessToken?: string }) => {
      setError("");
      setBusy(true);
      try {
        await loginGoogle(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không đăng nhập được Google.");
      } finally {
        setBusy(false);
      }
    },
    [loginGoogle],
  );

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap flex justify-center py-8 sm:py-10">
        <div className="shop-in relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-lg)] sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[var(--accent-warm)]/80 blur-3xl"
          />
          <p className="eyebrow relative">ECHO</p>
          <h1 className="relative mt-2 font-serif text-3xl font-medium tracking-tight text-[var(--ink)] sm:text-4xl">
            Xin chào
          </h1>
          <p className="relative mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
            Đăng nhập để xem đơn hàng và lưu thông tin giao hàng.
          </p>

          <div className="relative mt-4 inline-flex w-full rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1">
            {(
              [
                ["login", "Đăng nhập"],
                ["register", "Đăng ký"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition",
                  mode === id
                    ? "bg-white text-[var(--ink)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative mt-5 space-y-3">
            <GoogleSignInButton onToken={onGoogle} onError={setError} disabled={busy} />

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                setBusy(true);
                setError("");
                try {
                  if (mode === "login") {
                    await login(String(fd.get("email") ?? ""), String(fd.get("password") ?? ""));
                  } else {
                    await register({
                      name: String(fd.get("name") ?? ""),
                      email: String(fd.get("email") ?? ""),
                      password: String(fd.get("password") ?? ""),
                    });
                  }
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Không thực hiện được.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {mode === "register" ? <Field id="name" label="Họ tên" required autoComplete="name" /> : null}
              <Field id="email" label="Email / Gmail" type="email" required autoComplete="email" />
              <Field
                id="password"
                label="Mật khẩu"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy ? "Đang xử lý…" : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </form>
          </div>

          <Link
            href="/san-pham"
            className="relative mt-5 block text-center text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-4 py-3 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2"
      />
    </div>
  );
}
