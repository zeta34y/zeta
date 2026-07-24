"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  link_url: string | null;
  audience: "all" | "user";
  target_user_id: string | null;
  is_active: boolean;
  created_at: string;
};

type NotificationState = {
  notification_id: string;
  user_id: string;
  read_at: string | null;
  deleted_at: string | null;
};

type NotificationItem = NotificationRow & {
  read: boolean;
};

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = new Date();
  const difference = now.getTime() - date.getTime();
  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function NotificationsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  useEffect(() => {
    let mounted = true;

    async function startPage() {
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

        if (!mounted) return;

        setUser(currentUser);

        await createAutomaticLoginNotification(currentUser);
        await loadNotifications(currentUser.id, mounted);
      } catch (error) {
        console.error("تعذر تحميل الإشعارات:", error);

        if (mounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "تعذر تحميل الإشعارات"
          );
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
          setLoadingNotifications(false);
        }
      }
    }

    startPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          router.replace("/");
          return;
        }

        setUser(session.user);
        await loadNotifications(session.user.id, true);
      }
    );

    const channel = supabase
      .channel("zeta-notifications-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async () => {
          const {
            data: { user: currentUser },
          } = await supabase.auth.getUser();

          if (currentUser) {
            await loadNotifications(currentUser.id, true);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function createAutomaticLoginNotification(
    currentUser: User
  ) {
    const sessionKey = `zeta_login_notification_${currentUser.id}`;

    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .insert({
        title: "تم تسجيل الدخول",
        body: "تم تسجيل الدخول إلى حسابك في متجر ZETA بنجاح.",
        audience: "user",
        target_user_id: currentUser.id,
        is_active: true,
        created_by: null,
      });

    if (!error) {
      sessionStorage.setItem(sessionKey, "1");
    }
  }

  async function loadNotifications(
    userId: string,
    shouldUpdate = true
  ) {
    setLoadingNotifications(true);
    setErrorMessage("");

    try {
      const [notificationsResult, statesResult] =
        await Promise.all([
          supabase
            .from("notifications")
            .select(
              "id, title, body, image_url, link_url, audience, target_user_id, is_active, created_at"
            )
            .eq("is_active", true)
            .or(
              `audience.eq.all,and(audience.eq.user,target_user_id.eq.${userId})`
            )
            .order("created_at", { ascending: false }),

          supabase
            .from("notification_user_states")
            .select(
              "notification_id, user_id, read_at, deleted_at"
            )
            .eq("user_id", userId),
        ]);

      if (notificationsResult.error) {
        throw notificationsResult.error;
      }

      if (statesResult.error) {
        throw statesResult.error;
      }

      const states = new Map(
        ((statesResult.data ?? []) as NotificationState[]).map(
          (state) => [state.notification_id, state]
        )
      );

      const visibleNotifications = (
        (notificationsResult.data ?? []) as NotificationRow[]
      )
        .filter(
          (notification) =>
            !states.get(notification.id)?.deleted_at
        )
        .map((notification) => ({
          ...notification,
          read: Boolean(
            states.get(notification.id)?.read_at
          ),
        }));

      if (shouldUpdate) {
        setNotifications(visibleNotifications);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل الإشعارات"
      );
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function markAsRead(id: string) {
    if (!user) return;

    const { error } = await supabase
      .from("notification_user_states")
      .upsert(
        {
          notification_id: id,
          user_id: user.id,
          read_at: new Date().toISOString(),
          deleted_at: null,
        },
        {
          onConflict: "notification_id,user_id",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  async function markAllAsRead() {
    if (!user || !notifications.length) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notification_user_states")
      .upsert(
        notifications.map((notification) => ({
          notification_id: notification.id,
          user_id: user.id,
          read_at: now,
          deleted_at: null,
        })),
        {
          onConflict: "notification_id,user_id",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  async function deleteNotification(id: string) {
    if (!user) return;

    const { error } = await supabase
      .from("notification_user_states")
      .upsert(
        {
          notification_id: id,
          user_id: user.id,
          deleted_at: new Date().toISOString(),
        },
        {
          onConflict: "notification_id,user_id",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotifications((current) =>
      current.filter(
        (notification) => notification.id !== id
      )
    );
  }

  async function clearAll() {
    if (!user || !notifications.length) return;

    const confirmed = window.confirm(
      "هل تريد حذف جميع الإشعارات من حسابك؟"
    );

    if (!confirmed) return;

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("notification_user_states")
      .upsert(
        notifications.map((notification) => ({
          notification_id: notification.id,
          user_id: user.id,
          deleted_at: now,
        })),
        {
          onConflict: "notification_id,user_id",
        }
      );

    if (error) {
      setErrorMessage(error.message);
      return;
    }

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

  if (!user) return null;

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
        {errorMessage && (
          <div className="mb-4 rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
            {errorMessage}

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="mr-3 text-white"
            >
              ×
            </button>
          </div>
        )}

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
                className="rounded-xl border border-sky-400/15 bg-sky-500/10 px-3 py-2 text-[9px] font-black text-sky-300 transition active:scale-95 sm:text-[10px]"
              >
                قراءة الكل
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-[9px] font-black text-red-300 transition active:scale-95 sm:text-[10px]"
              >
                حذف الكل
              </button>
            )}
          </div>
        </div>

        {loadingNotifications ? (
          <div className="mt-8 text-center text-sm text-gray-500">
            جاري تحديث الإشعارات...
          </div>
        ) : notifications.length === 0 ? (
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
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sky-500/10 text-xl">
                    {notification.image_url ? (
                      <img
                        src={notification.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "🔔"
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black">
                          {notification.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {formatNotificationTime(
                            notification.created_at
                          )}
                        </p>
                      </div>

                      {!notification.read && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.65)]" />
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-6 text-gray-400">
                      {notification.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="rounded-xl border border-sky-400/15 bg-sky-500/10 px-3 py-2 text-[10px] font-black text-sky-300 transition active:scale-95"
                        >
                          تحديد كمقروء
                        </button>
                      )}

                      {notification.link_url && (
                        <Link
                          href={notification.link_url}
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-300 transition active:scale-95"
                        >
                          فتح
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-3 py-2 text-[10px] font-black text-red-300 transition active:scale-95"
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