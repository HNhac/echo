import { ShopLink as Link } from "@/components/store/shop-link";

export function EmptyCatalog({ title = "Chưa có sản phẩm" }: { title?: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-serif text-2xl font-medium text-[var(--ink)]">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
        Catalog lấy từ CMS. Thêm sản phẩm và tải ảnh lên tại cms.echothuvui.vn.
      </p>
      <Link href="/lien-he" className="btn-secondary mt-6">
        Liên hệ shop
      </Link>
    </div>
  );
}
