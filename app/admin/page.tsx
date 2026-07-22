"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AdminTab =
  | "overview"
  | "orders"
  | "games"
  | "packages"
  | "users"
  | "notifications";

type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

type AdminOrder = {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const sampleOrders: AdminOrder[] = [
  {
    id: "ZT-1024",
    customer: "عبدالله محمد",
    total: 119,
    status: "processing",
    createdAt: "22 يوليو 2026",
  },
  {
    id: "ZT-1023",
    customer: "سعد العتيبي",
    total: 29,
    status: "completed",
    createdAt: "22 يوليو 2026",
  },
  {
    id: "ZT-1022",
    customer: "فيصل أحمد",
    total: 189,
    status: "pending",
    createdAt: "21 يوليو 2026",
  },
];

const statusLabel: Record<OrderStatus, string> = {
  pending: "بانتظار الدفع",
  processing: "قيد التجهيز",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const statusClass: Record<OrderStatus, string> = {
  pending:
    "border-amber-400/15 bg-amber-500/10 text-amber-300",
  processing:
    "border-sky-400/15 bg-sky-500/10 text-sky-300",
  completed:
    "border-emerald-400/15 bg-emerald-500/10 text-emerald-300",
  cancelled:
    "border-red-400/15 bg-red-500/10 text-red-300",
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [orders, setOrders] =
    useState<AdminOrder[]>(sampleOrders);
  const [message, setMessage] = useState("");

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

    async function verifyAdmin() {
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

        const isAdmin =
          currentUser.app_metadata?.role === "admin" ||
          currentUser.app_metadata?.user_role === "admin";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);
        setAuthorized(true);
      } catch (error) {
        console.error(
          "تعذر التحقق من صلاحية الإدارة:",
          error
        );

        router.replace("/");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    verifyAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
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
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function showMessage(value: string) {
    setMessage(value);

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  function updateOrderStatus(
    id: string,
    status: OrderStatus
  ) {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? { ...order, status }
          : order
      )
    );

    showMessage("تم تحديث حالة الطلب");
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-500" />
          <p className="mt-4 text-sm text-gray-400">
            جاري التحقق من صلاحية الإدارة...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized || !user) {
    return null;
  }

  const navItems: {
    id: AdminTab;
    label: string;
    icon: string;
  }[] = [
    {
      id: "overview",
      label: "نظرة عامة",
      icon: "📊",
    },
    {
      id: "orders",
      label: "الطلبات",
      icon: "📦",
    },
    {
      id: "games",
      label: "الألعاب",
      icon: "🎮",
    },
    {
      id: "packages",
      label: "البكجات",
      icon: "🎁",
    },
    {
      id: "users",
      label: "المستخدمون",
      icon: "👥",
    },
    {
      id: "notifications",
      label: "الإشعارات",
      icon: "🔔",
    },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-amber-700/10 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-violet-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-xl font-black shadow-lg shadow-amber-950/30">
              ⚙️
            </div>

            <div>
              <p className="text-[10px] font-bold text-amber-400">
                لوحة الإدارة
              </p>
              <h1 className="mt-1 text-lg font-black">
                إدارة متجر ZETA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
            >
              <span>المتجر</span>
              <span>←</span>
            </Link>

            <button
              type="button"
              onClick={logout}
              className="flex h-10 items-center rounded-2xl border border-red-400/15 bg-red-500/10 px-3 text-[10px] font-black text-red-300 transition hover:bg-red-500/15 active:scale-95"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[28px] border border-white/[0.07] bg-[#121019] p-3 lg:sticky lg:top-24">
          <div className="rounded-[22px] border border-amber-400/15 bg-amber-500/10 p-4">
            <p className="text-[10px] text-amber-400">
              مسجل كإداري
            </p>

            <h2 className="mt-1 truncate text-sm font-black">
              {adminName}
            </h2>

            <p
              dir="ltr"
              className="mt-1 truncate text-left text-[9px] text-gray-500"
            >
              {user.email}
            </p>
          </div>

          <nav className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-3 rounded-[18px] px-3 py-3 text-right text-xs font-black transition active:scale-[0.98] ${
                  tab === item.id
                    ? "bg-amber-500/15 text-amber-200"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  {
                    label: "إجمالي الطلبات",
                    value: orders.length,
                    icon: "📦",
                  },
                  {
                    label: "قيد التجهيز",
                    value: orders.filter(
                      (order) =>
                        order.status === "processing"
                    ).length,
                    icon: "⚙️",
                  },
                  {
                    label: "طلبات مكتملة",
                    value: orders.filter(
                      (order) =>
                        order.status === "completed"
                    ).length,
                    icon: "✓",
                  },
                  {
                    label: "إجمالي المبيعات",
                    value: `${orders.reduce(
                      (total, order) =>
                        total + order.total,
                      0
                    )} ر.س`,
                    icon: "💰",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-white/[0.07] bg-[#121019] p-4"
                  >
                    <span className="text-2xl">
                      {card.icon}
                    </span>
                    <p className="mt-3 text-xl font-black">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[28px] border border-white/[0.07] bg-[#121019] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-amber-400">
                      أحدث الطلبات
                    </p>
                    <h2 className="mt-1 text-lg font-black">
                      آخر العمليات
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setTab("orders")}
                    className="text-xs font-black text-amber-300"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 rounded-[20px] border border-white/[0.06] bg-black/20 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">
                          {order.id}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-gray-500">
                          {order.customer}
                        </p>
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-black">
                          {order.total} ر.س
                        </p>
                        <span
                          className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[8px] font-black ${statusClass[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab === "orders" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-5">
              <div>
                <p className="text-[10px] font-bold text-violet-400">
                  إدارة الطلبات
                </p>
                <h2 className="mt-1 text-lg font-black">
                  جميع الطلبات
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[22px] border border-white/[0.07] bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">
                          {order.id}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          {order.customer} •{" "}
                          {order.createdAt}
                        </p>
                      </div>

                      <p className="text-lg font-black">
                        {order.total} ر.س
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        [
                          "pending",
                          "processing",
                          "completed",
                          "cancelled",
                        ] as OrderStatus[]
                      ).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            updateOrderStatus(
                              order.id,
                              status
                            )
                          }
                          className={`rounded-xl border px-3 py-2 text-[9px] font-black transition active:scale-95 ${
                            order.status === status
                              ? statusClass[status]
                              : "border-white/10 bg-white/5 text-gray-500"
                          }`}
                        >
                          {statusLabel[status]}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {tab === "games" && (
            <EmptyAdminSection
              icon="🎮"
              title="إدارة الألعاب"
              description="هنا تضيف الألعاب وتعدل الأسعار والصور والمخزون."
              button="إضافة لعبة"
            />
          )}

          {tab === "packages" && (
            <EmptyAdminSection
              icon="🎁"
              title="إدارة البكجات"
              description="هنا تنشئ البكجات وتحدد الألعاب الموجودة داخل كل بكج."
              button="إضافة بكج"
            />
          )}

          {tab === "users" && (
            <EmptyAdminSection
              icon="👥"
              title="إدارة المستخدمين"
              description="هنا تظهر حسابات المستخدمين وطلباتهم وحالاتهم."
              button="عرض المستخدمين"
            />
          )}

          {tab === "notifications" && (
            <EmptyAdminSection
              icon="🔔"
              title="إرسال إشعار"
              description="أرسل إشعارًا لكل المستخدمين أو لمستخدم محدد."
              button="إنشاء إشعار"
            />
          )}
        </div>
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-emerald-400/15 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}
    </main>
  );
}

function EmptyAdminSection({
  icon,
  title,
  description,
  button,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] px-5 py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-amber-500/10 text-4xl">
        {icon}
      </div>

      <h2 className="mt-5 text-xl font-black">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-500">
        {description}
      </p>

      <button
        type="button"
        className="mt-6 rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-amber-950/30 transition active:scale-95"
      >
        {button}
      </button>
    </section>
  );
}