"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const CART_KEY = "zeta_cart";
const COUPON_DETAILS_KEY = "zeta_coupon_details";
const PENDING_PAYMENT_KEY = "zeta_pending_payment";
const PENDING_ORDER_KEY = "zeta_pending_order";

type VerifyState = "checking" | "success" | "failed";

function PaymentResult() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id") ?? "";
  const orderId = searchParams.get("order_id") ?? "";
  const [state, setState] = useState<VerifyState>("checking");
  const [message, setMessage] = useState("جاري التحقق من عملية الدفع بأمان...");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    let mounted = true;

    async function verifyPayment() {
      if (!paymentId || !orderId) {
        setState("failed");
        setMessage("بيانات العملية ناقصة. افتح طلباتك وتأكد من حالة الطلب.");
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("سجّل الدخول بالحساب الذي نفّذ عملية الشراء.");
        }

        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ paymentId, orderId }),
        });

        const result = (await response.json()) as {
          success?: boolean;
          orderNumber?: string;
          error?: string;
        };

        if (!response.ok || !result.success) {
          throw new Error(result.error || "تعذر اعتماد عملية الدفع.");
        }

        if (!mounted) return;

        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(COUPON_DETAILS_KEY);
        localStorage.removeItem(PENDING_PAYMENT_KEY);
        localStorage.removeItem(PENDING_ORDER_KEY);
        window.dispatchEvent(new CustomEvent("zeta-cart-updated", { detail: [] }));

        setOrderNumber(result.orderNumber || "");
        setState("success");
        setMessage(
          "شكرًا لشرائك من ZETA. تم اعتماد الدفع وبدأ تجهيز بيانات الاستلام الخاصة بك."
        );
      } catch (error) {
        if (!mounted) return;
        setState("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "تعذر التحقق من العملية. لا تعِد الدفع قبل مراجعة طلباتك."
        );
      }
    }

    void verifyPayment();

    return () => {
      mounted = false;
    };
  }, [orderId, paymentId]);

  const success = state === "success";

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08070d] px-4 py-10 text-white"
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-700/20 blur-[130px]" />
        <div className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-fuchsia-700/15 blur-[130px]" />
      </div>

      <section className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-[#121019]/95 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] text-4xl ${
            state === "checking"
              ? "bg-violet-500/15"
              : success
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-red-500/15 text-red-300"
          }`}
        >
          {state === "checking" ? (
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/10 border-t-violet-400" />
          ) : success ? (
            "✓"
          ) : (
            "!"
          )}
        </div>

        <p className="mt-5 text-[10px] font-black text-violet-300">
          {state === "checking"
            ? "التحقق الآمن"
            : success
              ? "تم الدفع بنجاح"
              : "تحتاج العملية للمراجعة"}
        </p>

        <h1 className="mt-2 text-2xl font-black">
          {state === "checking"
            ? "لحظات ونجهّز طلبك"
            : success
              ? "شكرًا لشرائك من ZETA"
              : "لم نعتمد الطلب حتى الآن"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-gray-400">{message}</p>

        {(orderNumber || orderId) && (
          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-right">
            <p className="text-[10px] font-bold text-gray-500">رقم الطلب</p>
            <p dir="ltr" className="mt-1 text-left text-sm font-black text-white">
              {orderNumber || orderId}
            </p>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-right text-[11px] leading-6 text-amber-100">
            بيانات الحساب أو كود اللعبة مخصصة لك وحدك. لا تشاركها مع أي شخص.
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black"
          >
            الرئيسية
          </Link>

          <Link
            href={orderId ? `/orders/${orderId}` : "/orders"}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-4 text-xs font-black shadow-lg shadow-violet-900/30"
          >
            {success ? "عرض الاستلام" : "طلباتي"}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#08070d] text-white">
          جاري تحميل نتيجة الدفع...
        </main>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}