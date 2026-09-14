"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountLoading } from "@/components/account/account-loading";
import { useCustomer } from "@/components/account/customer-provider";

export function RequireCustomer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, customer } = useCustomer();

  useEffect(() => {
    if (ready && !customer) router.replace("/tai-khoan");
  }, [ready, customer, router]);

  if (!ready) return <AccountLoading />;
  if (!customer) return null;
  return <>{children}</>;
}
