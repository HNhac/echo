import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreProviders } from "@/components/cart/store-providers";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProviders>
      <AnnouncementBar />
      <Header />
      <main className="relative z-[1] flex-1">{children}</main>
      <Footer />
    </StoreProviders>
  );
}
