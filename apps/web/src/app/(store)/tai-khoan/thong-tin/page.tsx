import { AccountFrame } from "@/components/account/account-frame";
import { AccountProfileForm } from "@/components/account/account-profile-form";
import { RequireCustomer } from "@/components/account/require-customer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Thông tin cá nhân | ECHO",
    robots: { index: false, follow: false },
  };
}

export default function AccountProfilePage() {
  return (
    <RequireCustomer>
      <AccountFrame>
        <AccountProfileForm />
      </AccountFrame>
    </RequireCustomer>
  );
}
