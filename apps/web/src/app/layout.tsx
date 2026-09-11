import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Outfit } from "next/font/google";
import { brand } from "@/config/brand";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

/** Bitdefender injects `bis_skin_checked` onto the DOM before React hydrates. */
const stripExtensionAttrsScript = `(function(){var a="bis_skin_checked";function s(e){if(e&&e.nodeType===1&&e.removeAttribute&&e.hasAttribute(a))e.removeAttribute(a)}function w(r){s(r);if(!r||!r.querySelectorAll)return;var n=r.querySelectorAll("["+a+"]");for(var i=0;i<n.length;i++)s(n[i])}try{var p=Element.prototype,sa=p.setAttribute;p.setAttribute=function(n,v){if(String(n)===a)return;return sa.call(this,n,v)};w(document.documentElement);new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==="attributes")s(m.target);else for(var j=0;j<m.addedNodes.length;j++)w(m.addedNodes[j])}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:[a]})}catch(e){}})();`;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s`,
  },
  description:
    "Thời trang bé gái 1–10 tuổi — váy đầm, set bộ, áo và phụ kiện. Vải mềm, form dễ mặc, size 90–140.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: brand.name,
    title: `${brand.name} — ${brand.tagline}`,
    description: "Váy xòe, set dễ vận động và phụ kiện xinh cho bé gái.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${fraunces.variable} ${outfit.variable} scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Script
          id="strip-extension-attrs"
          strategy="beforeInteractive"
        >
          {stripExtensionAttrsScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
