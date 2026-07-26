import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SitePresence from "@/components/SitePresence";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZETA",
  description: "متجر الألعاب الرقمية",
};

export const viewport: Viewport = {
  themeColor: "#160b25",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: "#160b25" }}
    >
      <body
        className="min-h-full flex flex-col text-white"
        style={{
          backgroundColor: "#08070d",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, #2a1745 0%, #140c20 45%, #08070d 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        {/*
          طبقة سريعة لأول لحظة فقط.
          تختفي بالـ CSS بدون state وبدون removeChild،
          وبعدها يظهر أنميشن الصفحة الرئيسي.
        */}
        <div
          aria-hidden="true"
          className="zeta-first-paint-splash"
        >
          <div className="zeta-first-paint-glow" />

          <div className="zeta-first-paint-logo-wrap">
            <div className="zeta-first-paint-ring" />

            <div className="zeta-first-paint-logo">
              <span>Z</span>
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              .zeta-first-paint-splash {
                position: fixed;
                inset: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                pointer-events: none;
                background:
                  radial-gradient(
                    circle at 50% 30%,
                    #2a1745 0%,
                    #140c20 45%,
                    #08070d 100%
                  );
                animation:
                  zetaFirstPaintHide 180ms ease 280ms forwards;
              }

              .zeta-first-paint-glow {
                position: absolute;
                width: 310px;
                height: 310px;
                border-radius: 9999px;
                background: rgba(109, 40, 217, 0.34);
                filter: blur(95px);
              }

              .zeta-first-paint-logo-wrap {
                position: relative;
                z-index: 1;
              }

              .zeta-first-paint-ring {
                position: absolute;
                inset: -12px;
                border-radius: 42px;
                border: 1px solid rgba(196, 181, 253, 0.3);
                box-shadow: 0 0 45px rgba(139, 92, 246, 0.45);
              }

              .zeta-first-paint-logo {
                position: relative;
                width: 112px;
                height: 112px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border-radius: 34px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background:
                  linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
                box-shadow: 0 25px 70px rgba(88, 28, 135, 0.55);
              }

              .zeta-first-paint-logo span {
                transform: skewX(-6deg);
                font-size: 72px;
                line-height: 1;
                font-weight: 900;
                color: #ffffff;
                text-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
              }

              @keyframes zetaFirstPaintHide {
                from {
                  opacity: 1;
                  visibility: visible;
                }

                to {
                  opacity: 0;
                  visibility: hidden;
                }
              }

              @media (prefers-reduced-motion: reduce) {
                .zeta-first-paint-splash {
                  animation-duration: 1ms;
                  animation-delay: 80ms;
                }
              }
            `,
          }}
        />

        <SitePresence />
        {children}
      </body>
    </html>
  );
}