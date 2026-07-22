"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "كيف أشتري لعبة؟",
    a: "اختر اللعبة التي تريدها، أضفها إلى السلة، ثم أكمل عملية الدفع. بعد تأكيد الطلب سيتم تجهيز طلبك بأسرع وقت."
  },
  {
    q: "كم يستغرق تسليم الطلب؟",
    a: "معظم الطلبات يتم تجهيزها خلال وقت قصير، وقد تختلف المدة حسب نوع المنتج."
  },
  {
    q: "هل الألعاب أصلية؟",
    a: "نحرص على توفير منتجات رقمية موثوقة وعالية الجودة."
  },
  {
    q: "هل يمكن استرجاع الطلب؟",
    a: "يمكن الاطلاع على سياسة الإرجاع لمعرفة الحالات التي يسمح فيها بالاسترجاع."
  },
  {
    q: "كيف أتواصل مع الدعم؟",
    a: "يمكنك التواصل معنا من صفحة التواصل الموجودة أسفل الموقع."
  },
  {
    q: "هل أستطيع الشراء من الجوال؟",
    a: "نعم، متجر ZETA مصمم ليعمل بشكل ممتاز على الجوال والأجهزة اللوحية."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#08070d] text-white"
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-violet-700/15 blur-[100px]" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-fuchsia-700/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 bg-[#08070d]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-violet-500/10 transition"
          >
            ← رجوع
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <h1 className="font-black">ZETA</h1>
              <p className="text-[10px] text-gray-500">
                الأسئلة الشائعة
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-black">
              Z
            </div>
          </div>

        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        <div className="text-center mb-8">

          <span className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold">
            FAQ
          </span>

          <h2 className="text-3xl font-black mt-5">
            الأسئلة الشائعة
          </h2>

          <p className="text-gray-500 mt-3 text-sm">
            أكثر الأسئلة التي تصلنا من العملاء.
          </p>

        </div>

        <div className="space-y-4">

          {faqs.map((item, index) => (

            <div
              key={index}
              className="rounded-[24px] border border-white/10 bg-[#111019] overflow-hidden"
            >

              <button
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
                className="w-full flex items-center justify-between p-5 text-right"
              >

                <span className="font-black">
                  {item.q}
                </span>

                <span
                  className={`text-2xl transition ${
                    open === index ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>

              </button>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  open === index
                    ? "max-h-60"
                    : "max-h-0"
                }`}
              >

                <p className="px-5 pb-5 text-sm leading-7 text-gray-400">
                  {item.a}
                </p>

              </div>

            </div>

          ))}

        </div>

        <div className="mt-10 text-center">

          <Link
            href="/"
            className="inline-flex px-7 py-3 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 font-black hover:brightness-110 transition"
          >
            العودة للمتجر
          </Link>

        </div>

      </section>

      <footer className="border-t border-white/5 py-6 text-center text-gray-600 text-xs">
        جميع الحقوق محفوظة © 2026 ZETA
      </footer>

    </main>
  );
}