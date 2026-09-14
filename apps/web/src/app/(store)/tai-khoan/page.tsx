import { AccountPageClient } from "@/components/account/account-page-client";
import type { Metadata } from "next";
import { metadataForPage } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return metadataForPage("tai-khoan", "Tài khoản", "Đăng nhập — ECHO.");
}

export default function AccountPage() {
  return <AccountPageClient />;
}
