import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SeasonTheme } from "@/components/layout/season-theme";
import { StoreProviders } from "@/components/cart/store-providers";
import { activeShopNotices } from "@echo/shared";
import { fetchShopSettings } from "@/lib/store-api";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await fetchShopSettings();
  const notices = activeShopNotices(settings.notices);

  return (
    <StoreProviders>
      {settings.seasonTheme !== "default" ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.dataset.season=${JSON.stringify(settings.seasonTheme)}`,
          }}
        />
      ) : null}
      <SeasonTheme
        theme={settings.seasonTheme}
        overlays={settings.seasonOverlays}
        shared={settings.seasonOverlayShared}
      />
      <div id="top" />
      <AnnouncementBar items={settings.announcementEnabled ? notices : []} />
      <Header />
      <main className="relative z-[1] flex-1">{children}</main>
      <Footer notes={settings.footerNotesEnabled ? notices : []} />
    </StoreProviders>
  );
}
