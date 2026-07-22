"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AccountSheetProps = {
  open: boolean;
  user: User;
  onClose: () => void;
};

export default function AccountSheet({
  open,
  user,
  onClose,
}: AccountSheetProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const userName = useMemo(() => {
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      user.phone ||
      "مستخدم"
    );
  }, [user]);

  const avatarUrl = useMemo(() => {
    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      ""
    );
  }, [user]);

  const isAdmin =
    user.app_metadata?.role === "admin" ||
    user.app_metadata?.user_role === "admin";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", closeWithEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [open, onClose]);

  function goTo(path: string) {
    onClose();
    router.push(path);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      onClose();

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated")
      );

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("تعذر تسجيل الخروج:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[520] transition duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="إغلاق قائمة الحساب"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="قائمة الحساب"
        className={`absolute bottom-3 left-0 right-0 mx-auto max-h-[88vh] w-[92%] max-w-[430px] overflow-y-auto rounded-[30px] border border-violet-300/15 bg-[#0e0b15] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-30px_90px_rgba(76,29,149,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:bottom-6 sm:max-w-lg sm:rounded-[34px] ${
          open ? "translate-y-0" : "translate-y-[115%]"
        }`}
      >
        <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15" />

        <div className="mt-5 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-gray-300 transition hover:bg-white/10 active:scale-90"
          >
            ×
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
            <div className="min-w-0 text-right">
              <div className="flex items-center justify-end gap-2">
                {isAdmin && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-black text-amber-300">
                    إداري
                  </span>
                )}

                <h2 className="truncate text-lg font-black">
                  {userName}
                </h2>
              </div>

              <p
                dir="ltr"
                className="mt-1 truncate text-left text-[11px] text-gray-500"
              >
                {user.email || user.phone || "حساب ZETA"}
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl font-black shadow-lg shadow-violet-950/40">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => goTo("/notifications")}
            className="group rounded-[22px] border border-sky-400/10 bg-sky-500/[0.06] p-4 text-right transition hover:border-sky-400/30 hover:bg-sky-500/10 active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl transition group-hover:scale-105">
              🔔
            </span>

            <h3 className="mt-3 text-sm font-black">
              الإشعارات
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-gray-500">
              آخر التنبيهات والتحديثات
            </p>
          </button>

          <button
            type="button"
            onClick={() => goTo("/orders")}
            className="group rounded-[22px] border border-violet-400/10 bg-violet-500/[0.06] p-4 text-right transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-[0.98]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl transition group-hover:scale-105">
              📦
            </span>

            <h3 className="mt-3 text-sm font-black">
              الطلبات
            </h3>

            <p className="mt-1 text-[10px] leading-5 text-gray-500">
              متابعة طلباتك ومشترياتك
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => goTo("/account")}
          className="mt-3 flex w-full items-center justify-between rounded-[22px] border border-fuchsia-400/10 bg-fuchsia-500/[0.06] p-4 text-right transition hover:border-fuchsia-400/30 hover:bg-fuchsia-500/10 active:scale-[0.99]"
        >
          <div>
            <h3 className="text-sm font-black">حسابي</h3>
            <p className="mt-1 text-[10px] text-gray-500">
              البريد والجوال وكلمة المرور
            </p>
          </div>

          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-2xl">
            👤
          </span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => goTo("/admin")}
            className="mt-3 flex w-full items-center justify-between rounded-[22px] border border-amber-400/20 bg-amber-500/10 p-4 text-right transition hover:bg-amber-500/15 active:scale-[0.99]"
          >
            <div>
              <p className="text-[9px] font-bold text-amber-400">
                صلاحية إدارية
              </p>

              <h3 className="mt-1 text-sm font-black">
                إدارة المتجر
              </h3>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl">
              ⚙️
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-red-400/15 bg-red-500/10 px-5 py-4 text-sm font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>↪</span>
          <span>
            {loggingOut
              ? "جاري تسجيل الخروج..."
              : "تسجيل الخروج"}
          </span>
        </button>
      </section>
    </div>
  );
}