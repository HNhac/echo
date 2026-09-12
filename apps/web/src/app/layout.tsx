import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Outfit } from "next/font/google";
import { brand } from "@/config/brand";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

/** Bitdefender injects bis_* attrs and a 200.js that throws on M_ID during fetch. */
const stripExtensionAttrsScript = `(function(){function junk(n){n=String(n||"");return n==="bis_skin_checked"||n==="bis_register"||n.indexOf("__processed_")==0}function s(e){if(!e||e.nodeType!==1||!e.removeAttribute||!e.attributes)return;for(var i=e.attributes.length-1;i>=0;i--){var n=e.attributes[i].name;if(junk(n))e.removeAttribute(n)}}function w(r){s(r);if(!r||!r.querySelectorAll)return;var n=r.querySelectorAll("*");for(var i=0;i<n.length;i++)s(n[i])}function ext(err){var m=String(err&&err.message||err||"");var st=String(err&&err.stack||"");return m.indexOf("M_ID")>=0||st.indexOf("200.js")>=0}try{window.addEventListener("unhandledrejection",function(e){if(ext(e.reason)){e.preventDefault();e.stopImmediatePropagation()}},true);window.addEventListener("error",function(e){if(ext(e.error)||String(e.filename||"").indexOf("200.js")>=0){e.preventDefault();e.stopImmediatePropagation()}},true);var p=Element.prototype,sa=p.setAttribute;p.setAttribute=function(n,v){if(junk(n))return;return sa.call(this,n,v)};w(document.documentElement);new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var m=ms[i];if(m.type==="attributes")s(m.target);else for(var j=0;j<m.addedNodes.length;j++)w(m.addedNodes[j])}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true})}catch(e){}})();`;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext", "vietnamese"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
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
      data-scroll-behavior="smooth"
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
