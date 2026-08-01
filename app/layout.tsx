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
          تظهر هذه الطبقة من أول بايت يصل للجوال.
          تبقى متحركة إلى أن تصبح شاشة الأنميشن الأصلية جاهزة،
          ثم تخفيها الصفحة الرئيسية بدون أي شاشة سوداء بينهما.
        */}
        <div
          id="zeta-first-paint-splash"
          aria-hidden="true"
          className="zeta-first-paint-splash"
        >
          <div className="zeta-first-paint-glow" />

          <div className="zeta-first-paint-content">
            <div className="zeta-first-paint-logo-wrap">
              <div className="zeta-first-paint-ring" />

              <div className="zeta-first-paint-logo">
                <span>Z</span>
                <div className="zeta-first-paint-shine" />
              </div>
            </div>

            <div className="zeta-first-paint-title">ZETA</div>
            <div className="zeta-first-paint-subtitle">
              عالمك يبدأ من هنا
            </div>

            <div className="zeta-first-paint-loader">
              <div />
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
                opacity: 1;
                visibility: visible;
                background:
                  radial-gradient(
                    circle at 50% 30%,
                    #2a1745 0%,
                    #140c20 45%,
                    #08070d 100%
                  );
                transition:
                  opacity 220ms ease,
                  visibility 0s linear 220ms;
              }

              .zeta-first-paint-splash.zeta-first-paint-ready {
                opacity: 0;
                visibility: hidden;
              }

              .zeta-first-paint-glow {
                position: absolute;
                width: 310px;
                height: 310px;
                border-radius: 9999px;
                background: rgba(109, 40, 217, 0.34);
                filter: blur(95px);
                animation: zetaFirstPaintPulse 1200ms ease-in-out infinite;
              }

              .zeta-first-paint-content {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation:
                  zetaFirstPaintEnter 700ms
                  cubic-bezier(0.22, 1, 0.36, 1) both;
              }

              .zeta-first-paint-logo-wrap {
                position: relative;
              }

              .zeta-first-paint-ring {
                position: absolute;
                inset: -12px;
                border-radius: 42px;
                border: 1px solid rgba(196, 181, 253, 0.3);
                box-shadow: 0 0 45px rgba(139, 92, 246, 0.45);
                animation: zetaFirstPaintRing 1200ms ease-in-out infinite;
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
                position: relative;
                z-index: 1;
                transform: skewX(-6deg);
                font-size: 72px;
                line-height: 1;
                font-weight: 900;
                color: #ffffff;
                text-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
              }

              .zeta-first-paint-shine {
                position: absolute;
                inset: -70%;
                background:
                  linear-gradient(
                    110deg,
                    transparent 42%,
                    rgba(255, 255, 255, 0.55) 50%,
                    transparent 58%
                  );
                animation:
                  zetaFirstPaintShine 1400ms ease 250ms infinite;
              }

              .zeta-first-paint-title {
                margin-top: 24px;
                color: #ffffff;
                font-size: 30px;
                line-height: 1;
                font-weight: 900;
                letter-spacing: 8px;
              }

              .zeta-first-paint-subtitle {
                margin-top: 10px;
                color: #c4b5fd;
                font-size: 14px;
                line-height: 1.5;
              }

              .zeta-first-paint-loader {
                width: 128px;
                height: 4px;
                margin-top: 28px;
                overflow: hidden;
                border-radius: 9999px;
                background: rgba(255, 255, 255, 0.1);
              }

              .zeta-first-paint-loader > div {
                width: 45%;
                height: 100%;
                border-radius: 9999px;
                background:
                  linear-gradient(90deg, #8b5cf6 0%, #e879f9 100%);
                box-shadow: 0 0 16px rgba(168, 85, 247, 0.75);
                animation:
                  zetaFirstPaintLoading 900ms ease-in-out infinite;
              }

              @keyframes zetaFirstPaintEnter {
                0% {
                  opacity: 0;
                  transform: translateY(18px) scale(0.78) rotate(-8deg);
                }

                70% {
                  opacity: 1;
                  transform: translateY(0) scale(1.06) rotate(2deg);
                }

                100% {
                  opacity: 1;
                  transform: translateY(0) scale(1) rotate(0);
                }
              }

              @keyframes zetaFirstPaintPulse {
                0%,
                100% {
                  opacity: 0.72;
                  transform: scale(0.96);
                }

                50% {
                  opacity: 1;
                  transform: scale(1.05);
                }
              }

              @keyframes zetaFirstPaintRing {
                0%,
                100% {
                  opacity: 0.65;
                  transform: scale(0.98);
                }

                50% {
                  opacity: 1;
                  transform: scale(1.035);
                }
              }

              @keyframes zetaFirstPaintShine {
                from {
                  transform: translateX(-55%) rotate(12deg);
                }

                to {
                  transform: translateX(55%) rotate(12deg);
                }
              }

              @keyframes zetaFirstPaintLoading {
                0% {
                  transform: translateX(170%);
                }

                50% {
                  transform: translateX(0);
                }

                100% {
                  transform: translateX(-170%);
                }
              }

              @media (prefers-reduced-motion: reduce) {
                .zeta-first-paint-glow,
                .zeta-first-paint-content,
                .zeta-first-paint-ring,
                .zeta-first-paint-shine,
                .zeta-first-paint-loader > div {
                  animation-duration: 1ms;
                  animation-iteration-count: 1;
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