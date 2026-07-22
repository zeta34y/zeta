"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

type OrderItem = {
  id: string;
  name: string;
  platform: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
};

const sampleOrders: Order[] = [
  {
    id: "ZT-1024",
    createdAt: "22 يوليو 2026",
    status: "processing",
    total: 119,
    paymentMethod: "Apple Pay",
    items: [
      {
        id: "package-2",
        name: "بكج العالم المفتوح",
        platform: "3 ألعاب PC",
        price: 119,
        quantity: 1,
      },
    ],
  },
  {
    id: "ZT-0987",
    createdAt: "18 يوليو 2026",
    status: "completed",
    total: 29,
    paymentMethod: "VISA",
    items: [
      {
        id: "shared-1",
        name: "EA SPORTS FC",
        platform: "Steam PC",
        price: 29,
        quantity: 1,
      },
    ],
  },
  {
    id: "ZT-0954",
    createdAt: "12 يوليو 2026",
    status: "cancelled",
    total: 35,
    paymentMethod: "مدى",
    items: [
      {
        id: "shared-3",
        name: "Forza Horizon",
        platform: "Xbox PC",
        price: 35,
        quantity: 1,
      },
    ],
  },
];

const statusInfo: Record<
  OrderStatus,
  {
    label: string;
    textClass: string;
    bgClass: string;
    borderClass: string;
    icon: string;
  }
> = {
  pending: {
    label: "بانتظار الدفع",
    textClass: "text-amber-300",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-400/15",
    icon: "⏳",
  },
  processing: {
    label: "قيد التجهيز",
    textClass: "text-sky-300",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-400/15",
    icon: "⚙️",
  },
  completed: {
    label: "مكتمل",
    textClass: "text-emerald-300",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-400/15",
    icon: "✓",
  },
  cancelled: {
    label: "ملغي",
    textClass: "text-red-300",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-400/15",
    icon: "✕",
  },
};

type OrderFilter = "الكل" | "الحالية" | "المكتملة" | "الملغاة";

export default function OrdersPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [filter, setFilter] = useState<OrderFilter>("الكل");

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
        console.error("تعذر التحقق من المستخدم:", error);

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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/");
        return;
      }

      setUser(session.user);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const filteredOrders = useMemo(() => {
    if (filter === "الكل") {
      return orders;
    }

    if (filter === "الحالية") {
      return orders.filter(
        (order) =>
          order.status === "pending" ||
          order.status === "processing"
      );
    }

    if (filter === "المكتملة") {
      return orders.filter(
        (order) => order.status === "completed"
      );
    }

    return orders.filter(
      (order) => order.status === "cancelled"
    );
  }, [filter, orders]);

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.status === "processing"
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  function removeCancelledOrder(id: string) {
    const confirmed = window.confirm(
      "هل تريد حذف هذا الطلب الملغي من القائمة؟"
    );

    if (!confirmed) return;

    setOrders((current) =>
      current.filter((order) => order.id !== id)
    );
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
            جاري تحميل الطلبات...
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
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-700/12 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[360px] w-[360px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-bold text-violet-400">
              مشترياتك
            </p>

            <h1 className="mt-1 text-xl font-black">
              الطلبات
            </h1>
          </div>

          <Link
            href="/account"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span>حسابي</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4 text-center">
            <p className="text-2xl font-black">
              {totalOrders}
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              كل الطلبات
            </p>
          </div>

          <div className="rounded-[22px] border border-sky-400/10 bg-sky-500/[0.05] p-4 text-center">
            <p className="text-2xl font-black text-sky-300">
              {activeOrders}
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              طلبات حالية
            </p>
          </div>

          <div className="rounded-[22px] border border-emerald-400/10 bg-emerald-500/[0.05] p-4 text-center">
            <p className="text-2xl font-black text-emerald-300">
              {completedOrders}
            </p>
            <p className="mt-1 text-[10px] text-gray-500">
              مكتملة
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["الكل", "الحالية", "المكتملة", "الملغاة"] as OrderFilter[]).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-full border px-5 py-3 text-xs font-black transition ${
                  filter === item
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-white/10 bg-white/[0.04] text-gray-400"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-white/[0.07] bg-[#121019] px-5 py-12 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-violet-500/10 text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-black">
              لا توجد طلبات
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-gray-500">
              عندما تشتري لعبة أو بكجًا سيظهر طلبك هنا.
            </p>

            <Link
              href="/offers"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-black shadow-xl shadow-violet-950/30 transition active:scale-95"
            >
              اكتشف العروض
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const status = statusInfo[order.status];

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#121019] shadow-xl"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4">
                    <div>
                      <p className="text-[10px] text-gray-500">
                        رقم الطلب
                      </p>
                      <p
                        dir="ltr"
                        className="mt-1 text-sm font-black text-white"
                      >
                        {order.id}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black ${status.borderClass} ${status.bgClass} ${status.textClass}`}
                    >
                      <span>{status.icon}</span>
                      <span>{status.label}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-[20px] border border-white/[0.06] bg-black/20 p-3"
                        >
                          <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-2xl">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "🎮"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">
                              {item.name}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-gray-500">
                              {item.platform}
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-gray-500">
                                الكمية: {item.quantity}
                              </span>

                              <span className="text-sm font-black">
                                {item.price * item.quantity}
                                <span className="mr-1 text-[9px] text-gray-500">
                                  ر.س
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-[9px] text-gray-500">
                          تاريخ الطلب
                        </p>
                        <p className="mt-1 font-black">
                          {order.createdAt}
                        </p>
                      </div>

                      <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-[9px] text-gray-500">
                          طريقة الدفع
                        </p>
                        <p className="mt-1 font-black">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
                      <div>
                        <p className="text-[10px] text-gray-500">
                          إجمالي الطلب
                        </p>
                        <p className="mt-1 text-xl font-black">
                          {order.total}
                          <span className="mr-1 text-[10px] text-gray-500">
                            ر.س
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {order.status === "pending" && (
                          <Link
                            href={`/checkout?order=${order.id}`}
                            className="rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-4 py-3 text-[10px] font-black text-white transition active:scale-95"
                          >
                            إكمال الدفع
                          </Link>
                        )}

                        {order.status === "processing" && (
                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-xl border border-sky-400/15 bg-sky-500/10 px-4 py-3 text-[10px] font-black text-sky-300 transition active:scale-95"
                          >
                            متابعة الطلب
                          </Link>
                        )}

                        {order.status === "completed" && (
                          <Link
                            href={`/orders/${order.id}`}
                            className="rounded-xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-[10px] font-black text-emerald-300 transition active:scale-95"
                          >
                            تفاصيل الاستلام
                          </Link>
                        )}

                        {order.status === "cancelled" && (
                          <button
                            type="button"
                            onClick={() =>
                              removeCancelledOrder(order.id)
                            }
                            className="rounded-xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-[10px] font-black text-red-300 transition active:scale-95"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}