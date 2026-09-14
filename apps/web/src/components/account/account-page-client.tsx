"use client";

import { AccountAuth } from "@/components/account/account-auth";
import { AccountFrame } from "@/components/account/account-frame";
import { AccountHome } from "@/components/account/account-home";
import { AccountLoading } from "@/components/account/account-loading";
import { useCustomer } from "@/components/account/customer-provider";

export function AccountPageClient() {
  const { ready, customer } = useCustomer();

  if (!ready) return <AccountLoading />;
  if (!customer) return <AccountAuth />;

  return (
    <AccountFrame>
      <AccountHome />
    </AccountFrame>
  );
}
