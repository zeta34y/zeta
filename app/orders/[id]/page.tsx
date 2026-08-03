"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

type Delivery = {
  id: string;
  delivery_type: "account" | "steam_code";
  delivery_index: number;
  username: string | null;
  password: string | null;
  steam_code: string | null;
  verification_note: string | null;
  delivered_at: string | null;
};

type OrderItem = {
  id: string;
  item_name: string;
  item_type: "product" | "package";
  product_display_kind: string | null;
  delivery_kind: "account" | "steam_code" | null;
  platform: string | null;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  order_deliveries?: Delivery[];
};

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string | null;
  total: number;
  customer_name: string | null;
  created_at: string;
  paid_at: string | null;
  order_items?: OrderItem[];
};

const statusText: Record<OrderStatus, string> = {
  pending: "بانتظار الدفع",
  paid: "تم الدفع",
  processing: "قيد تجهيز بياناتك",
  delivered: "بيانات الاستلام جاهزة",
  completed: "الطلب مكتمل",
  cancelled: "الطلب ملغي",
  refunded: "تم استرجاع الطلب",
  rejected: "الطلب مرفوض",
};

function formatMoney(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("ar-SA", { maximumFractionDigits: 2 })
    : "0";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isDeliveryReady(delivery: Delivery) {
  return delivery.delivery_type === "steam_code"
    ? Boolean(delivery.steam_code?.trim())
    : Boolean(delivery.username?.trim() && delivery.password?.trim());
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          router.replace("/");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              user_id,
              status,
              payment_status,
              payment_method,
              total,
              customer_name,
              created_at,
              paid_at,
              order_items (
                id,
                item_name,
                item_type,
                product_display_kind,
                delivery_kind,
                platform,
                image_url,
                quantity,
                unit_price,
                total_price,
                order_deliveries (
                  id,
                  delivery_type,
                  delivery_index,
                  username,
                  password,
                  steam_code,
                  verification_note,
                  delivered_at
                )
              )
            `
          )
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("الطلب غير موجود أو لا يخص هذا الحساب.");
        if (!mounted) return;

        setOrder(data as unknown as Order);
        setErrorMessage("");
      } catch (error) {
        console.error("تعذر تحميل تفاصيل الطلب:", error);
        if (mounted) {
          setOrder(null);
          setErrorMessage(
            error instanceof Error ? error.message : "تعذر تحميل تفاصيل الطلب."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadOrder();

    const channel = supabase
      .channel(`zeta-order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        () => void loadOrder()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_deliveries",
          filter: `order_id=eq.${orderId}`,
        },
        () => void loadOrder()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [orderId, router]);

  const allDeliveries = useMemo(
    () =>
      (order?.order_items ?? []).flatMap((item) =>
        (item.order_deliveries ?? []).map((delivery) => ({ item, delivery }))
      ),
    [order]
  );
  const readyCount = allDeliveries.filter(({ delivery }) =>
    isDeliveryReady(delivery)
  ).length;
  const allReady = allDeliveries.length > 0 && readyCount === allDeliveries.length;

  async function copyValue(key: string, value: string | null) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08070d] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm text-gray-400">جاري تحميل بيانات طلبك...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white"
      >
        <section className="w-full max-w-md rounded-[28px] border border-red-400/15 bg-red-500/10 p-6 text-center">
          <div className="text-4xl">!</div>
          <h1 className="mt-4 text-xl font-black">تعذر فتح الطلب</h1>
          <p className="mt-2 text-sm leading-7 text-red-100/70">{errorMessage}</p>
          <Link
            href="/orders"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-xs font-black text-black"
          >
            العودة لطلباتي
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-violet-700/18 blur-[140px]" />
        <div className="absolute -left-40 top-[600px] h-[400px] w-[400px] rounded-full bg-fuchsia-700/12 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href="/orders"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black"
          >
            <span>→</span>
            <span>طلباتي</span>
          </Link>
          <div className="text-left">
            <p className="text-[10px] text-gray-500">رقم الطلب</p>
            <p dir="ltr" className="mt-1 text-sm font-black">{order.order_number}</p>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-4 py-6">
        <div className="overflow-hidden rounded-[32px] border border-violet-400/15 bg-[radial-gradient(circle_at_80%_10%,rgba(139,92,246,0.3),transparent_35%),linear-gradient(135deg,#1a1325,#0f0c17_70%)] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
                {order.payment_status === "paid" ? "تم الدفع بنجاح ✓" : "حالة الدفع قيد المراجعة"}
              </span>
              <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                شكرًا لشرائك من ZETA
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-gray-400">
                {allReady
                  ? "تم تجهيز بيانات استلامك. احتفظ بها لنفسك ولا تشاركها مع أي شخص."
                  : "طلبك عندنا الآن، وسيكتب الإداري بيانات الاستلام الخاصة بكل عنصر داخل هذا الطلب."}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-center sm:min-w-44">
              <p className="text-[10px] text-gray-500">حالة الطلب</p>
              <p className="mt-2 text-sm font-black text-violet-200">
                {statusText[order.status]}
              </p>
              <p className="mt-2 text-[10px] text-gray-500">
                {readyCount} من {allDeliveries.length} جاهز
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Info label="رقم الطلب" value={order.order_number} ltr />
          <Info label="الإجمالي" value={`${formatMoney(order.total)} ر.س`} />
          <Info label="تاريخ الطلب" value={formatDate(order.created_at)} />
          <Info label="وقت الدفع" value={formatDate(order.paid_at)} />
        </div>

        <div className="mt-6 rounded-[26px] border border-amber-400/15 bg-amber-500/[0.08] p-4 text-sm leading-7 text-amber-100">
          <p className="font-black">تنبيه مهم</p>
          <p className="mt-1 text-xs text-amber-100/70">
            اسم المستخدم وكلمة المرور أو كود Steam مخصص لهذا الطلب ولهذا الحساب فقط. لا ترسله لأي شخص ولا تنشره في أي مكان.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          {(order.order_items ?? []).map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121019] shadow-xl"
            >
              <div className="flex gap-4 border-b border-white/[0.06] p-4 sm:p-5">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-violet-500/10 text-3xl">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.item_name} className="h-full w-full object-cover" />
                  ) : (
                    "🎮"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-violet-300">
                    {item.delivery_kind === "steam_code" ? "كود تفعيل خاص" : "بيانات دخول مستقلة"}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-black">{item.item_name}</h2>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {item.platform || (item.item_type === "package" ? "بكج ألعاب" : "PC")}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {(item.order_deliveries ?? [])
                  .slice()
                  .sort((a, b) => a.delivery_index - b.delivery_index)
                  .map((delivery) => {
                    const ready = isDeliveryReady(delivery);

                    return (
                      <div
                        key={delivery.id}
                        className={`rounded-[22px] border p-4 ${
                          ready
                            ? "border-emerald-400/15 bg-emerald-500/[0.06]"
                            : "border-white/[0.07] bg-black/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-gray-500">
                              الاستلام رقم {delivery.delivery_index}
                            </p>
                            <p className="mt-1 text-xs font-black">
                              {delivery.delivery_type === "steam_code"
                                ? "كود اللعبة"
                                : "حساب اللعبة"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
                              ready
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {ready ? "جاهز" : "قيد التجهيز"}
                          </span>
                        </div>

                        {!ready ? (
                          <div className="mt-4 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
                            <div className="text-3xl">⏳</div>
                            <p className="mt-3 text-xs font-black">الإدارة تجهّز بياناتك الآن</p>
                            <p className="mt-1 text-[10px] leading-5 text-gray-500">
                              ستظهر هنا تلقائيًا فور حفظها لهذا الطلب.
                            </p>
                          </div>
                        ) : delivery.delivery_type === "steam_code" ? (
                          <div className="mt-4">
                            <SecretField
                              label="كود تفعيل Steam"
                              value={delivery.steam_code || ""}
                              copied={copied === `${delivery.id}-code`}
                              onCopy={() =>
                                void copyValue(`${delivery.id}-code`, delivery.steam_code)
                              }
                              mono
                            />
                            <div className="mt-3 rounded-2xl border border-violet-400/15 bg-violet-500/10 px-4 py-3 text-[11px] leading-6 text-violet-100">
                              افتح Steam ثم اختر Games وبعدها Activate a Product on Steam، والصق الكود. لا تشارك الكود مع أي شخص.
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <SecretField
                              label="اسم المستخدم"
                              value={delivery.username || ""}
                              copied={copied === `${delivery.id}-username`}
                              onCopy={() =>
                                void copyValue(`${delivery.id}-username`, delivery.username)
                              }
                            />
                            <SecretField
                              label="كلمة المرور"
                              value={delivery.password || ""}
                              copied={copied === `${delivery.id}-password`}
                              onCopy={() =>
                                void copyValue(`${delivery.id}-password`, delivery.password)
                              }
                            />
                          </div>
                        )}

                        {ready && delivery.verification_note && (
                          <p className="mt-3 text-[10px] leading-5 text-gray-400">
                            {delivery.verification_note}
                          </p>
                        )}
                      </div>
                    );
                  })}
              </div>
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-[28px] border border-white/[0.08] bg-[#121019] p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">🔑</div>
            <div>
              <h2 className="text-base font-black">الحصول على رمز التحقق</h2>
              <p className="mt-1 text-[10px] text-gray-500">
                هذا القسم جاهز للتطوير وسيتم ربط طريقته لاحقًا.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="mt-4 min-h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] text-xs font-black text-gray-600"
          >
            الحصول على الرمز — قريبًا
          </button>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-white/[0.035] p-3">
      <p className="text-[9px] text-gray-500">{label}</p>
      <p dir={ltr ? "ltr" : undefined} className={`mt-1 text-xs font-black ${ltr ? "text-left" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function SecretField({
  label,
  value,
  copied,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-3">
      <p className="text-[9px] text-gray-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p
          dir="ltr"
          className={`min-w-0 flex-1 break-all text-left text-sm font-black text-white ${
            mono ? "tracking-wider" : ""
          }`}
        >
          {value}
        </p>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[10px] font-black active:scale-95"
        >
          {copied ? "تم النسخ" : "نسخ"}
        </button>
      </div>
    </div>
  );
}