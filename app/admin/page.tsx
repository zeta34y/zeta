"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AnnouncementBar = {
  id: number;
  text: string;
  emoji: string | null;
  link_url: string | null;
  is_visible: boolean;
};

const defaultAnnouncement: AnnouncementBar = {
  id: 1,
  text: "افتتاح متجر ZETA — خصم 10%",
  emoji: "🎉",
  link_url: "",
  is_visible: true,
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [announcement, setAnnouncement] =
    useState<AnnouncementBar>(defaultAnnouncement);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const adminName = useMemo(() => {
    if (!user) return "الإدارة";

    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "الإدارة"
    );
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function startPage() {
      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!currentUser) {
          router.replace("/");
          return;
        }

        const isAdmin =
          currentUser.app_metadata?.role === "admin" ||
          currentUser.app_metadata?.user_role === "admin";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        const { data, error } = await supabase
          .from("announcement_bar")
          .select("id, text, emoji, link_url, is_visible")
          .eq("id", 1)
          .maybeSingle();

        if (error) throw error;

        if (!mounted) return;

        setUser(currentUser);
        setAuthorized(true);

        if (data) {
          setAnnouncement({
            id: 1,
            text: data.text ?? "",
            emoji: data.emoji ?? "",
            link_url: data.link_url ?? "",
            is_visible: Boolean(data.is_visible),
          });
        }
      } catch (error) {
        console.error(error);

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "تعذر تحميل إعدادات الشريط العلوي"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    startPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        router.replace("/");
        return;
      }

      const isAdmin =
        currentUser.app_metadata?.role === "admin" ||
        currentUser.app_metadata?.user_role === "admin";

      if (!isAdmin) {
        router.replace("/");
        return;
      }

      setUser(currentUser);
      setAuthorized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function saveAnnouncement() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const cleanText = announcement.text.trim();

      if (!cleanText) {
        throw new Error("اكتب نص الشريط أولًا");
      }

      const { error } = await supabase
        .from("announcement_bar")
        .upsert(
          {
            id: 1,
            text: cleanText,
            emoji: announcement.emoji?.trim() || null,
            link_url: announcement.link_url?.trim() || null,
            is_visible: announcement.is_visible,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;

      setMessage("تم حفظ الشريط العلوي بنجاح");

      window.setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ الشريط العلوي"
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />

          <p className="mt-4 text-sm text-gray-400">
            جاري تحميل لوحة الإدارة...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized || !user) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-10 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-violet-700/10 blur-[130px]" />

        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xl shadow-lg shadow-violet-950/30">
              ⚙️
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold text-violet-300">
                لوحة الإدارة
              </p>

              <h1 className="mt-1 truncate text-lg font-black">
                إدارة متجر ZETA
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition hover:bg-white/10 active:scale-95"
            >
              <span>المتجر</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="hidden h-10 items-center rounded-2xl border border-red-400/15 bg-red-500/10 px-3 text-[10px] font-black text-red-300 transition hover:bg-red-500/15 active:scale-95 sm:flex"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 rounded-[24px] border border-white/[0.07] bg-[#121019] p-4">
          <p className="text-[10px] text-violet-300">
            مسجل كإداري
          </p>

          <h2 className="mt-1 text-sm font-black">
            {adminName}
          </h2>

          <p
            dir="ltr"
            className="mt-1 truncate text-left text-[9px] text-gray-500"
          >
            {user.email}
          </p>
        </div>

        <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-violet-300">
                إعدادات المتجر
              </p>

              <h2 className="mt-1 text-xl font-black">
                الشريط العلوي
              </h2>

              <p className="mt-2 text-xs leading-6 text-gray-500">
                عدّل النص الموجود أعلى المتجر أو أخفِ الشريط بالكامل.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
              📢
            </div>
          </div>

          <div className="mt-6 rounded-[22px] border border-violet-400/20 bg-gradient-to-l from-violet-600/25 via-fuchsia-500/20 to-violet-600/25 px-4 py-3 text-center">
            {announcement.is_visible ? (
              <p className="text-sm font-black text-white">
                {announcement.emoji && (
                  <span className="ml-2">{announcement.emoji}</span>
                )}

                {announcement.text || "معاينة الشريط العلوي"}
              </p>
            ) : (
              <p className="text-xs font-black text-gray-400">
                الشريط مخفي حاليًا
              </p>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-black text-gray-300">
                النص داخل الشريط
              </span>

              <textarea
                value={announcement.text}
                onChange={(event) =>
                  setAnnouncement((current) => ({
                    ...current,
                    text: event.target.value,
                  }))
                }
                rows={3}
                placeholder="مثال: افتتاح متجر ZETA — استخدم كود ZETA10"
                className="w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black text-gray-300">
                  الإيموجي
                </span>

                <input
                  value={announcement.emoji || ""}
                  onChange={(event) =>
                    setAnnouncement((current) => ({
                      ...current,
                      emoji: event.target.value,
                    }))
                  }
                  placeholder="🎉"
                  maxLength={8}
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-black text-gray-300">
                  الرابط عند الضغط — اختياري
                </span>

                <input
                  dir="ltr"
                  value={announcement.link_url || ""}
                  onChange={(event) =>
                    setAnnouncement((current) => ({
                      ...current,
                      link_url: event.target.value,
                    }))
                  }
                  placeholder="/offers"
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                />
              </label>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div>
                <p className="text-sm font-black">
                  إظهار الشريط العلوي
                </p>

                <p className="mt-1 text-[10px] leading-5 text-gray-500">
                  عطّل الخيار لإخفاء الشريط من المتجر.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={announcement.is_visible}
                onClick={() =>
                  setAnnouncement((current) => ({
                    ...current,
                    is_visible: !current.is_visible,
                  }))
                }
                className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                  announcement.is_visible
                    ? "bg-gradient-to-l from-violet-500 to-fuchsia-500"
                    : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition ${
                    announcement.is_visible
                      ? "right-1"
                      : "right-7"
                  }`}
                />
              </button>
            </label>

            {errorMessage && (
              <div className="rounded-[18px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-xs font-bold text-red-300">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="rounded-[18px] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center text-xs font-bold text-emerald-300">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={saveAnnouncement}
              disabled={saving}
              className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ الشريط العلوي"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}