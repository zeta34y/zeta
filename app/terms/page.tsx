"use client";

import Link from "next/link";

const terms = [
  {
    title: "1. قبول الشروط",
    text: "باستخدامك لموقع ZETA فإنك توافق على جميع الشروط والأحكام الموضحة في هذه الصفحة."
  },
  {
    title: "2. المنتجات الرقمية",
    text: "جميع المنتجات المباعة في ZETA هي منتجات رقمية، ويجب التأكد من اختيار المنتج الصحيح قبل الشراء."
  },
  {
    title: "3. الأسعار",
    text: "قد يتم تعديل الأسعار أو العروض في أي وقت دون إشعار مسبق."
  },
  {
    title: "4. الحسابات",
    text: "يتحمل العميل مسؤولية المحافظة على بيانات الحساب وعدم مشاركتها مع الآخرين."
  },
  {
    title: "5. إساءة الاستخدام",
    text: "يمنع استخدام الموقع لأي غرض غير قانوني أو محاولة الإضرار بالموقع أو مستخدميه."
  },
  {
    title: "6. حقوق الملكية",
    text: "جميع الشعارات والتصاميم والمحتوى داخل ZETA محفوظة حقوقها ولا يجوز نسخها أو إعادة استخدامها دون إذن."
  }
];

export default function TermsPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#08070d] text-white"
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-violet-700/15 blur-[100px]" />
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
                الشروط والأحكام
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center font-black">
              Z
            </div>
          </div>

        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-4 py-8">

        <div className="text-center">

          <span className="px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold">
            TERMS
          </span>

          <h2 className="text-3xl font-black mt-5">
            الشروط والأحكام
          </h2>

          <p className="text-gray-500 mt-3">
            يرجى قراءة هذه الشروط قبل استخدام الموقع.
          </p>

        </div>

        <div className="mt-8 space-y-5">

          {terms.map((item, index) => (

            <div
              key={index}
              className="rounded-[26px] border border-white/10 bg-[#111019] p-6"
            >

              <h3 className="text-lg font-black text-violet-300">
                {item.title}
              </h3>

              <p className="mt-3 leading-8 text-gray-400 text-sm">
                {item.text}
              </p>

            </div>

          ))}

        </div>

        <div className="mt-10 text-center">

          <Link
            href="/"
            className="inline-flex px-8 py-3 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 font-black hover:brightness-110 transition"
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