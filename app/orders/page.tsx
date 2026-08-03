"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "rejected";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type OrderItem = {
  id: string;
  item_name: string;
  item_type: "product" | "package";
  platform: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
};

type OrderFilter = "الكل" | "الحالية" | "المكتملة" | "الملغاة";

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
  paid: {
    label: "تم الدفع",
    textClass: "text-cyan-300",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-400/15",
    icon: "✓",
  },
  processing: {
    label: "قيد التجهيز",
    textClass: "text-sky-300",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-400/15",
    icon: "⚙️",
  },
  delivered: {
    label: "جاهز للاستلام",
    textClass: "text-violet-300",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-400/15",
    icon: "🔑",
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
  refunded: {
    label: "مسترجع",
    textClass: "text-orange-300",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-400/15",
    icon: "↩",
  },
  rejected: {
    label: "مرفوض",
    textClass: "text-rose-300",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-400/15",
    icon: "!",
  },
};

function formatMoney(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("ar-SA", { maximumFractionDigits: 2 })
    : "0";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function paymentMethodLabel(value: string | null) {
  if (!value) return "—";
  const normalized = value.toLowerCase();
  if (normalized.includes("apple")) return "Apple Pay";
  if (normalized.includes("mada")) return "مدى";
  if (normalized.includes("visa")) return "Visa";
  if (normalized.includes("master")) return "MasterCard";
  return value;
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("الكل");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    let currentUserId = "";

    async function loadOrders() {
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

        currentUserId = currentUser.id;

        const { data, error } = await supabase
          .from("orders")
          .select(
            "id, order_number, status, payment_status, payment_method, total, created_at, order_items(id, item_name, item_type, platform, image_url, quantity, unit_price, total_price)"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!mounted) return;

        setUser(currentUser);
        setOrders((data ?? []) as unknown as Order[]);
        setErrorMessage("");
      } catch (error) {
        console.error("تعذر تحميل الطلبات:", error);
        if (mounted) {
          setOrders([]);
          setErrorMessage("تعذر تحميل طلباتك. حدّث الصفحة وحاول مرة أخرى.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadOrders();

    const ordersChannel = supabase
      .channel("zeta-user-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => void loadOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_deliveries" },
        () => void loadOrders()
      )
      .subscribe();

    return () => {
      mounted = false;
      void currentUserId;
      supabase.removeChannel(ordersChannel);
    };
  }, [router]);

  const filteredOrders = useMemo(() => {
    if (filter === "الكل") return orders;

    if (filter === "الحالية") {
      return orders.filter((order) =>
        ["pending", "paid", "processing", "delivered"].includes(order.status)
      );
    }

    if (filter === "المكتملة") {
      return orders.filter((order) => order.status === "completed");
    }

    return orders.filter((order) =>
      ["cancelled", "refunded", "rejected"].includes(order.status)
    );
  }, [filter, orders]);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) =>
    ["pending", "paid", "processing", "delivered"].includes(order.status)
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm text-gray-400">جاري تحميل الطلبات...</p>
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
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-700/12 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[360px] w-[360px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[10px] font-bold text-violet-400">مشترياتك</p>
            <h1 className="mt-1 text-xl font-black">الطلبات</h1>
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

      <section className="relative z-10 mx-auto max-w-4xl px-4 py-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            [totalOrders, "كل الطلبات", "text-white"],
            [activeOrders, "طلبات حالية", "text-sky-300"],
            [completedOrders, "مكتملة", "text-emerald-300"],
          ].map(([value, label, className]) => (
            <div
              key={String(label)}
              className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4 text-center"
            >
              <p className={`text-2xl font-black ${className}`}>{value}</p>
              <p className="mt-1 text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
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

        {errorMessage && (
          <div className="mt-5 rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-white/[0.07] bg-[#121019] px-5 py-12 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-violet-500/10 text-4xl">
              📦
            </div>
            <h2 className="mt-5 text-xl font-black">لا توجد طلبات</h2>
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
                      <p className="text-[10px] text-gray-500">رقم الطلب</p>
                      <p dir="ltr" className="mt-1 text-left text-sm font-black">
                        {order.order_number}
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
                      {(order.order_items ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-[20px] border border-white/[0.06] bg-black/20 p-3"
                        >
                          <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-2xl">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.item_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "🎮"
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">{item.item_name}</p>
                            <p className="mt-1 truncate text-[10px] text-gray-500">
                              {item.platform || (item.item_type === "package" ? "بكج ألعاب" : "PC")}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-gray-500">
                                الكمية: {item.quantity}
                              </span>
                              <span className="text-sm font-black">
                                {formatMoney(item.total_price)}
                                <span className="mr-1 text-[9px] text-gray-500">ر.س</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-[9px] text-gray-500">تاريخ الطلب</p>
                        <p className="mt-1 font-black">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-[9px] text-gray-500">طريقة الدفع</p>
                        <p className="mt-1 font-black">
                          {paymentMethodLabel(order.payment_method)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.06] pt-4">
                      <div>
                        <p className="text-[10px] text-gray-500">إجمالي الطلب</p>
                        <p className="mt-1 text-xl font-black">
                          {formatMoney(order.total)}
                          <span className="mr-1 text-[10px] text-gray-500">ر.س</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        {order.status === "pending" && order.payment_status !== "paid" ? (
                          <Link
                            href="/checkout"
                            className="rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-4 py-3 text-[10px] font-black"
                          >
                            إكمال الدفع
                          </Link>
                        ) : (
                          <Link
                            href={`/orders/${order.id}`}
                            className={`rounded-xl border px-4 py-3 text-[10px] font-black ${
                              order.status === "delivered" || order.status === "completed"
                                ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
                                : "border-sky-400/15 bg-sky-500/10 text-sky-300"
                            }`}
                          >
                            {order.status === "delivered" || order.status === "completed"
                              ? "بيانات الاستلام"
                              : "متابعة الطلب"}
                          </Link>
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