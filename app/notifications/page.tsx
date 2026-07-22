"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string;
  read: boolean;
  type: "order" | "offer" | "account" | "system";
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "تم تسجيل دخول جديد",
    description: "تم تسجيل الدخول إلى حسابك في متجر ZETA بنجاح.",
    time: "الآن",
    icon: "👤",
    read: false,
    type: "account",
  },
  {
    id: 2,
    title: "خصم افتتاح المتجر",
    description: "استخدم كود ZETA10 واحصل على خصم 10% على طلبك.",
    time: "منذ ساعة",
    icon: "🔥",
    read: false,
    type: "offer",
  },
  {
    id: 3,
    title: "طلباتك تظهر هنا",
    description: "بعد إتمام أي طلب سنرسل لك تحديثات حالة الطلب هنا.",
    time: "اليوم",
    icon: "📦",
    read: true,
    type: "order",
  },
  {
    id: 4,
    title: "مرحبًا بك في ZETA",
    description: "تابع أحدث الألعاب والعروض والبكجات من صفحة المتجر.",
    time: "اليوم",
    icon: "🎮",
    read: true,
    type: "system",
  },
];

export default function NotificationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!currentUser) {
          router.replace("/");
          return;
        }

        if (mounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "تعذر التحقق من المستخدم:",
          error
        );

        if (mounted) {
          router.replace("/");
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          router.replace("/");
          return;
        }

        setUser(session.user);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function markAsRead(id: number) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function deleteNotification(id: number) {
    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  }

  function clearAll() {
    const confirmed = window.confirm(
      "هل تريد حذف جميع الإشعارات؟"
    );

    if (!confirmed) return;

    setNotifications([]);
  }

  if (loadingUser) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm text-gray-400">
            جاري تحميل الإشعارات...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-sky-700/10 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[360px] w-[360px] rounded-full bg-violet-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-bold text-sky-400">
              مركز التنبيهات
            </p>

            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-xl font-black">
                الإشعارات
              </h1>

              {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <Link
            href="/"
            aria-label="العودة للرئيسية"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            ×
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-sky-400">
              آخر التحديثات
            </p>

            <h2 className="mt-1 text-lg font-black">
              إشعارات حسابك
            </h2>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-xl border border-sky-400/15 bg-sky-500/10 px-3 py-2 text-[10px] font-black text-sky-300 transition hover:bg-sky-500/15 active:scale-95"
              >
                تحديد الكل كمقروء
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-[10px] font-black text-red-300 transition hover:bg-red-500/15 active:scale-95"
              >
                حذف الكل
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-white/[0.07] bg-[#121019] px-5 py-12 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-sky-500/10 text-4xl">
              🔔
            </div>

            <h3 className="mt-5 text-xl font-black">
              لا توجد إشعارات
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-500">
              عندما يصل تحديث جديد لطلبك أو حسابك سيظهر هنا.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-black shadow-xl shadow-violet-950/30 transition active:scale-95"
            >
              العودة للمتجر
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`relative overflow-hidden rounded-[24px] border p-4 transition ${
                  notification.read
                    ? "border-white/[0.06] bg-[#111019]"
                    : "border-sky-400/20 bg-sky-500/[0.06]"
                }`}
              >
                {!notification.read && (
                  <span className="absolute right-0 top-0 h-full w-1 bg-sky-500" />
                )}

                <div className="flex gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${
                      notification.type === "offer"
                        ? "bg-amber-500/10"
                        : notification.type === "order"
                        ? "bg-violet-500/10"
                        : notification.type === "account"
                        ? "bg-sky-500/10"
                        : "bg-white/5"
                    }`}
                  >
                    {notification.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black">
                          {notification.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {notification.time}
                        </p>
                      </div>

                      {!notification.read && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.65)]" />
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-6 text-gray-400">
                      {notification.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          className="rounded-xl border border-sky-400/15 bg-sky-500/10 px-3 py-2 text-[10px] font-black text-sky-300 transition hover:bg-sky-500/15 active:scale-95"
                        >
                          تحديد كمقروء
                        </button>
                      )}

                      {notification.type === "order" && (
                        <Link
                          href="/orders"
                          className="rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-300 transition hover:bg-violet-500/15 active:scale-95"
                        >
                          عرض الطلبات
                        </Link>
                      )}

                      {notification.type === "offer" && (
                        <Link
                          href="/offers"
                          className="rounded-xl border border-amber-400/15 bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-300 transition hover:bg-amber-500/15 active:scale-95"
                        >
                          عرض العروض
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                        className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-3 py-2 text-[10px] font-black text-red-300 transition hover:bg-red-500/10 active:scale-95"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}