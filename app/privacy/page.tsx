"use client";

import Link from "next/link";

const items = [
  {
    title: "جمع المعلومات",
    text: "قد نقوم بجمع المعلومات التي يقدمها المستخدم مثل الاسم والبريد الإلكتروني وبيانات الطلبات لتحسين تجربة الاستخدام."
  },
  {
    title: "حماية البيانات",
    text: "نلتزم باتخاذ الإجراءات المناسبة لحماية بيانات المستخدمين من الوصول غير المصرح به."
  },
  {
    title: "استخدام المعلومات",
    text: "تستخدم المعلومات فقط لإدارة الطلبات، تحسين الخدمات، والتواصل مع العملاء عند الحاجة."
  },
  {
    title: "مشاركة البيانات",
    text: "لا يتم بيع أو مشاركة بيانات العملاء مع أي طرف ثالث إلا إذا كان ذلك مطلوبًا قانونيًا."
  },
  {
    title: "ملفات تعريف الارتباط",
    text: "قد يستخدم الموقع ملفات تعريف الارتباط لتحسين الأداء وتخصيص تجربة المستخدم."
  },
  {
    title: "تحديث السياسة",
    text: "قد يتم تحديث سياسة الخصوصية في أي وقت، ويعد استمرار استخدام الموقع موافقة على التحديثات."
  }
];

export default function PrivacyPage() {
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
                سياسة الخصوصية
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
            PRIVACY
          </span>

          <h2 className="mt-5 text-3xl font-black">
            سياسة الخصوصية
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            خصوصيتك مهمة بالنسبة لنا.
          </p>

        </div>

        <div className="mt-8 space-y-5">

          {items.map((item, index) => (

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