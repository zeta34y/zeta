"use client";

import Link from "next/link";

const rules = [
  {
    title: "الاستخدام المسموح",
    text: "يجب استخدام موقع ZETA بطريقة قانونية وعدم استغلاله في أي نشاط مخالف للأنظمة أو يضر بالموقع أو بالمستخدمين."
  },
  {
    title: "الحساب الشخصي",
    text: "المستخدم مسؤول عن الحفاظ على سرية بيانات حسابه وعدم مشاركتها مع أي شخص آخر."
  },
  {
    title: "الطلبات",
    text: "يجب التأكد من جميع بيانات الطلب قبل إتمام عملية الشراء، حيث يتحمل العميل مسؤولية صحة المعلومات المدخلة."
  },
  {
    title: "المنتجات الرقمية",
    text: "جميع المنتجات المعروضة في ZETA هي منتجات رقمية، ويجب استخدامها وفقًا لشروط الجهة المالكة للمنتج."
  },
  {
    title: "إيقاف الحساب",
    text: "يحق لإدارة ZETA إيقاف أي حساب يثبت إساءة استخدامه للموقع أو مخالفته للشروط."
  },
  {
    title: "تعديل السياسة",
    text: "قد يتم تحديث سياسة الاستخدام في أي وقت، ويعد استمرار استخدام الموقع موافقة على آخر إصدار منها."
  }
];

export default function UsagePolicyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#08070d] text-white">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-700/15 blur-[100px]" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-fuchsia-700/10 blur-[100px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-violet-500/10"
          >
            ← رجوع
          </Link>

          <div className="flex items-center gap-3">

            <div className="text-left">
              <h1 className="font-black">ZETA</h1>
              <p className="text-[10px] text-gray-500">
                سياسة الاستخدام
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 font-black">
              Z
            </div>

          </div>

        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-8">

        <div className="text-center">

          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
            USAGE POLICY
          </span>

          <h2 className="mt-5 text-3xl font-black">
            سياسة الاستخدام
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            يرجى الالتزام بهذه السياسة عند استخدام متجر ZETA.
          </p>

        </div>

        <div className="mt-8 space-y-5">

          {rules.map((item, index) => (

            <article
              key={index}
              className="rounded-[26px] border border-white/10 bg-[#111019] p-6 transition hover:border-violet-400/30"
            >

              <h3 className="text-lg font-black text-violet-300">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-8 text-gray-400">
                {item.text}
              </p>

            </article>

          ))}

        </div>

        <div className="mt-10 text-center">

          <Link
            href="/"
            className="inline-flex rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-8 py-3 font-black transition hover:brightness-110"
          >
            العودة للمتجر
          </Link>

        </div>

      </section>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-gray-600">
        جميع الحقوق محفوظة © 2026 ZETA
      </footer>

    </main>
  );
}