"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentResult() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id") ?? "";
  const status = searchParams.get("status") ?? "";
  const message = searchParams.get("message") ?? "";
  const looksSuccessful = status.toLowerCase() === "paid";

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 py-10 text-white"
    >
      <section className="w-full max-w-md rounded-[30px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] text-4xl ${
            looksSuccessful ? "bg-emerald-500/15" : "bg-amber-500/15"
          }`}
        >
          {looksSuccessful ? "✓" : "⏳"}
        </div>

        <h1 className="mt-5 text-2xl font-black">
          {looksSuccessful ? "وصلت عملية الدفع" : "جاري مراجعة العملية"}
        </h1>

        <p className="mt-3 text-sm leading-7 text-gray-400">
          {looksSuccessful
            ? "وصلت نتيجة العملية من بوابة الدفع. سيتم اعتماد الطلب بعد التحقق من الحالة والمبلغ من الخادم."
            : message ||
              "لم تصل نتيجة نهائية بعد. لا تعِد الدفع قبل التأكد من حالة العملية."}
        </p>

        {paymentId && (
          <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/20 p-3 text-right">
            <p className="text-[10px] font-bold text-gray-500">رقم عملية الدفع</p>
            <p className="mt-1 break-all text-xs font-black text-gray-200">
              {paymentId}
            </p>
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
            href="/orders"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-4 text-xs font-black shadow-lg shadow-violet-900/30"
          >
            طلباتي
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