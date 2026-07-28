"use client";

import { useEffect, useState } from "react";

export default function InitialSplash() {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setClosing(true);
    }, 120);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 380);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 30%, #2a1745 0%, #140c20 45%, #08070d 100%)",
        opacity: closing ? 0 : 1,
        pointerEvents: closing ? "none" : "auto",
        transition: "opacity 260ms ease",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 310,
          height: 310,
          borderRadius: "9999px",
          background: "rgba(109,40,217,0.34)",
          filter: "blur(95px)",
          animation: "zetaInitialPulse 1.8s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation:
            "zetaInitialEnter 700ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -12,
              borderRadius: 42,
              border: "1px solid rgba(196,181,253,0.3)",
              boxShadow: "0 0 45px rgba(139,92,246,0.45)",
              animation: "zetaInitialPulse 1.8s ease-in-out infinite",
            }}
          />

          <div
            style={{
              position: "relative",
              width: 112,
              height: 112,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 34,
              border: "1px solid rgba(255,255,255,0.15)",
              background:
                "linear-gradient(135deg,#7c3aed 0%,#c026d3 100%)",
              boxShadow: "0 25px 70px rgba(88,28,135,0.55)",
            }}
          >
            <span
              style={{
                transform: "skewX(-6deg)",
                fontSize: 72,
                lineHeight: 1,
                fontWeight: 900,
                color: "#ffffff",
                textShadow: "0 10px 25px rgba(0,0,0,0.35)",
              }}
            >
              Z
            </span>
          </div>
        </div>

        <h1
          style={{
            marginTop: 24,
            marginBottom: 0,
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: 8,
            color: "#ffffff",
          }}
        >
          ZETA
        </h1>

        <p
          style={{
            marginTop: 8,
            marginBottom: 0,
            fontSize: 14,
            color: "#c4b5fd",
          }}
        >
          عالمك يبدأ من هنا
        </p>

        <div
          style={{
            marginTop: 28,
            width: 128,
            height: 4,
            overflow: "hidden",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              width: "45%",
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#8b5cf6 0%,#e879f9 100%)",
              boxShadow: "0 0 16px rgba(168,85,247,0.75)",
              animation:
                "zetaInitialLoading 900ms ease-in-out 150ms infinite",
            }}
          />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes zetaInitialEnter {
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

            @keyframes zetaInitialLoading {
              0% { transform: translateX(170%); }
              50% { transform: translateX(0); }
              100% { transform: translateX(-170%); }
            }

            @keyframes zetaInitialPulse {
              0%, 100% {
                opacity: 0.72;
                transform: scale(0.96);
              }
              50% {
                opacity: 1;
                transform: scale(1.04);
              }
            }
          `,
        }}
      />
    </div>
  );
}