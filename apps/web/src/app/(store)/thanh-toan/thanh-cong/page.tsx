import type { Metadata } from "next";
import { ShopLink as Link } from "@/components/store/shop-link";
import { brandPageTitle } from "@/config/brand";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: brandPageTitle("Đặt hàng thành công"),
  robots: { index: false, follow: false },
};

type Search = { ma?: string; pt?: string };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const ma = sp.ma ?? "ECHO-000000";
  const bank = sp.pt === "bank";

  return (
    <div className="bg-[var(--surface)]">
      <div className="shop-wrap flex justify-center py-16 sm:py-24">
        <div className="w-full max-w-lg rounded-[2rem] border border-[var(--border)] bg-white px-6 py-12 text-center shadow-[var(--shadow-lg)] sm:px-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--accent)] ring-1 ring-[var(--border)]">
            <Check className="h-7 w-7" strokeWidth={2} />
          </span>
          <h1 className="mt-6 font-serif text-3xl font-medium italic text-[var(--ink)]">
            Đã nhận đơn
          </h1>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Mã đơn <strong className="text-[var(--ink)]">{ma}</strong>
            {bank
              ? ". Chuyển khoản theo mã này, shop xác nhận rồi gửi hàng."
              : ". Shipper thu hộ khi giao (COD)."}
          </p>
          {bank ? (
            <p className="mt-4 rounded-2xl bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--ink-muted)]">
              STK: <strong className="text-[var(--ink)]">ECHO 0123456789 — MB Bank</strong>
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/san-pham" className="btn-primary">
              Mua thêm
            </Link>
            <Link href="/" className="btn-ghost">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
