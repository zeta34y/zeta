"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PRESENCE_SESSION_KEY = "zeta_presence_session_id";
const HEARTBEAT_MS = 30_000;

function getSessionId() {
  const existing = window.localStorage.getItem(PRESENCE_SESSION_KEY);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(PRESENCE_SESSION_KEY, sessionId);
  return sessionId;
}

export default function SitePresence() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const sessionId = getSessionId();

    async function touchPresence() {
      if (cancelled || document.visibilityState === "hidden") return;

      const { error } = await supabase.rpc("touch_site_presence", {
        p_session_id: sessionId,
        p_current_path: pathname || "/",
        p_user_agent: navigator.userAgent,
      });

      if (error) {
        console.warn("تعذر تحديث حالة الاتصال:", error.message);
      }
    }

    void touchPresence();

    const timer = window.setInterval(() => {
      void touchPresence();
    }, HEARTBEAT_MS);

    function handleVisibleOrFocused() {
      if (document.visibilityState === "visible") {
        void touchPresence();
      }
    }

    window.addEventListener("focus", handleVisibleOrFocused);
    document.addEventListener("visibilitychange", handleVisibleOrFocused);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", handleVisibleOrFocused);
      document.removeEventListener("visibilitychange", handleVisibleOrFocused);
    };
  }, [pathname]);

  return null;
}