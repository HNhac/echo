"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { foldVn, formatVnAddress, parseVnAddress, VN_PROVINCES, wardsOf } from "@/data/vn-address";
import { cn } from "@/lib/utils";

type Props = {
  name?: string;
  defaultValue?: string;
  required?: boolean;
};

export function AddressFields({ name = "address", defaultValue = "", required }: Props) {
  const initial = useMemo(() => parseVnAddress(defaultValue), [defaultValue]);
  const [province, setProvince] = useState(initial.province);
  const [ward, setWard] = useState(initial.ward);
  const [street, setStreet] = useState(initial.street);
  const wards = wardsOf(province);
  const composed = formatVnAddress({ street, ward, province });

  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <SearchSelect
          label="Tỉnh / Thành phố"
          value={province}
          required={required}
          placeholder="Chọn tỉnh / thành"
          searchPlaceholder="Tìm tỉnh, thành…"
          options={VN_PROVINCES.map((item) => ({
            value: item.name,
            label: item.name.replace(/^Tỉnh |^Thành phố /, ""),
          }))}
          onChange={(next) => {
            setProvince(next);
            setWard((current) => (wardsOf(next).includes(current) ? current : ""));
          }}
        />
        <SearchSelect
          label="Phường / Xã"
          value={ward}
          required={required}
          disabled={!province}
          placeholder={province ? "Chọn phường / xã" : "Chọn tỉnh trước"}
          searchPlaceholder="Tìm phường, xã…"
          options={wards.map((item) => ({ value: item, label: item }))}
          onChange={setWard}
        />
        <label className="block sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">Số nhà, đường</span>
          <input
            type="text"
            value={street}
            required={required}
            autoComplete="street-address"
            placeholder="Ví dụ: 12 Nguyễn Huệ"
            onChange={(e) => setStreet(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3.5 py-2.5 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2"
          />
        </label>
      </div>
      <p className="mt-1.5 text-xs text-[var(--ink-muted)]">Địa giới 2 cấp mới nhất — 34 tỉnh/thành, không còn quận/huyện.</p>
      <input type="hidden" name={name} value={composed} />
    </div>
  );
}

function SearchSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  required,
  disabled,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const selected = options.find((item) => item.value === value);

  const filtered = useMemo(() => {
    const q = foldVn(query);
    if (!q) return options;
    return options.filter((item) => foldVn(item.label).includes(q) || foldVn(item.value).includes(q));
  }, [options, query]);

  useEffect(() => {
    setActive(0);
  }, [query, options]);

  useEffect(() => {
    if (!open) return;
    const node = boxRef.current?.querySelector<HTMLElement>(`[data-active="true"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open, filtered]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative min-w-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">{label}</span>
      <div className="relative mt-1.5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={open ? searchPlaceholder : placeholder}
          value={open ? query : selected?.label ?? ""}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open) {
              e.preventDefault();
              const hit = filtered[active];
              if (hit) pick(hit.value);
            } else if (e.key === "Escape") {
              setOpen(false);
              setQuery("");
              inputRef.current?.blur();
            }
          }}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 py-2.5 pl-9 pr-9 text-sm outline-none ring-[var(--accent)] transition focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]" aria-hidden />
        {required && !disabled ? (
          <input
            tabIndex={-1}
            aria-hidden
            className="pointer-events-none absolute h-0 w-0 opacity-0"
            value={value}
            required
            onChange={() => undefined}
          />
        ) : null}
      </div>

      {open && !disabled ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--border)] bg-white py-1 shadow-[var(--shadow-md)]"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-[var(--ink-muted)]">Không tìm thấy</li>
          ) : (
            filtered.map((item, index) => {
              const on = item.value === value;
              return (
                <li key={item.value}>
                  <button
                    type="button"
                    role="option"
                    data-active={index === active ? "true" : undefined}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => pick(item.value)}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm",
                      index === active || on
                        ? "bg-[var(--surface-2)] text-[var(--ink)]"
                        : "text-[var(--ink)] hover:bg-[var(--surface-2)]/70",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
    </div>
  );
}
