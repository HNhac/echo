"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { AddressFields } from "@/components/forms/address-fields";
import { useCustomer } from "@/components/account/customer-provider";
import { cn } from "@/lib/utils";

export function AccountProfileForm() {
  const { customer, saveProfile } = useCustomer();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [changePass, setChangePass] = useState(false);

  if (!customer) return null;

  return (
    <form
      key={customer.id}
      className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        setSaved("");
        try {
          const password = String(fd.get("password") ?? "");
          await saveProfile({
            name: String(fd.get("name") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            address: String(fd.get("address") ?? ""),
            ...(password ? { password } : {}),
          });
          setSaved("Đã lưu thông tin.");
          const pass = e.currentTarget.querySelector<HTMLInputElement>("#profile-pass");
          if (pass) pass.value = "";
          setShowPass(false);
          setChangePass(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Không lưu được.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        <Field id="name" label="Họ tên" defaultValue={customer.name} required autoComplete="name" />
        <Field id="email" label="Email" defaultValue={customer.email} readOnly locked />
        <Field id="phone" label="Số điện thoại" type="tel" defaultValue={customer.phone} autoComplete="tel" />
        <AddressFields defaultValue={customer.address} />
        {changePass ? (
          <div className="sm:col-span-2 sm:max-w-md lg:col-span-3">
            <Field
              id="profile-pass"
              name="password"
              label={customer.google ? "Mật khẩu cho email" : "Mật khẩu muốn dùng"}
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              hint="Mật khẩu hiện tại không hiện ở đây."
              placeholder="Nhập mật khẩu mới"
              reveal
              revealed={showPass}
              onReveal={() => setShowPass((v) => !v)}
            />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] px-4 py-3 sm:px-5">
        <button type="submit" className="btn-primary h-11 px-5" disabled={busy}>
          {busy ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)]"
          onClick={() => {
            setChangePass((v) => !v);
            setShowPass(false);
          }}
        >
          {changePass ? "Huỷ đổi mật khẩu" : customer.google ? "Đặt mật khẩu" : "Đổi mật khẩu"}
        </button>
        {saved ? (
          <p className="cart-pop inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-hover)]">
            <Check className="h-4 w-4" aria-hidden />
            {saved}
          </p>
        ) : null}
        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  type = "text",
  required,
  defaultValue,
  autoComplete,
  readOnly,
  locked,
  multiline,
  reveal,
  revealed,
  onReveal,
  hint,
  placeholder,
}: {
  id: string;
  name?: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  autoComplete?: string;
  readOnly?: boolean;
  locked?: boolean;
  multiline?: boolean;
  reveal?: boolean;
  revealed?: boolean;
  onReveal?: () => void;
  hint?: string;
  placeholder?: string;
}) {
  const fieldClass = cn(
    "mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3.5 py-2.5 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2",
    readOnly && "cursor-default text-[var(--ink-muted)]",
    reveal && "pr-11",
  );

  return (
    <div>
      <label htmlFor={id} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
        {label}
        {locked ? <Lock className="h-3 w-3 text-[var(--ink-faint)]" aria-hidden /> : null}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            name={name ?? id}
            required={required}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            readOnly={readOnly}
            rows={2}
            placeholder={placeholder}
            className={cn(fieldClass, "resize-y")}
          />
        ) : (
          <input
            id={id}
            name={name ?? id}
            type={type}
            required={required}
            defaultValue={defaultValue}
            autoComplete={autoComplete}
            readOnly={readOnly}
            placeholder={placeholder}
            className={fieldClass}
          />
        )}
        {reveal ? (
          <button
            type="button"
            onClick={onReveal}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label={revealed ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-[var(--ink-muted)]">{hint}</p> : null}
    </div>
  );
}
