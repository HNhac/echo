import type { Metadata } from "next";
import Script from "next/script";
import { Be_Vietnam_Pro, Fraunces, Outfit } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
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

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-login",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ECHO Studio",
  description: "Quản lý sản phẩm và đơn hàng ECHO",
};

const themeBoot = `(function(){try{var q=new URLSearchParams(location.search).get('theme');var t=q==='light'||q==='dark'?q:localStorage.getItem('echo-cms-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${outfit.variable} ${beVietnam.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body suppressHydrationWarning>
        <Script id="strip-extension-attrs" strategy="beforeInteractive">
          {stripExtensionAttrsScript}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
