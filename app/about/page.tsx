"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] text-white"
    >
      {/* الخلفية */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-violet-700/15 blur-[100px]" />
        <div className="absolute -left-24 top-80 h-72 w-72 rounded-full bg-fuchsia-700/10 blur-[110px]" />
      </div>

      {/* الهيدر */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span className="text-lg">→</span>
            <span>العودة</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">متجر الألعاب الرقمية</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
              Z
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-8">
        {/* عنوان الصفحة */}
        <div className="relative overflow-hidden rounded-[32px] border border-violet-400/15 bg-gradient-to-br from-[#181324] to-[#0d0b13] p-6 shadow-2xl shadow-violet-950/20 sm:p-10">
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-violet-600/15 blur-[80px]" />
          <div className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-fuchsia-600/10 blur-[90px]" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
              تعرّف علينا
            </span>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              من نحن في
              <span className="mr-2 bg-gradient-to-l from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                ZETA
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
              ZETA متجر متخصص في بيع الألعاب الرقمية، ونسعى لتقديم تجربة شراء
              سهلة وسريعة وآمنة بأسعار مناسبة، مع اهتمام كبير بخدمة العملاء
              وسرعة تسليم الطلبات.
            </p>
          </div>
        </div>

        {/* قصتنا */}
        <div className="mt-6 rounded-[28px] border border-white/[0.07] bg-white/[0.035] p-5 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
              🎮
            </div>

            <div>
              <p className="text-xs font-bold text-violet-400">قصتنا</p>
              <h3 className="mt-1 text-xl font-black">لماذا بدأنا ZETA؟</h3>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
            بدأنا ZETA لأننا نؤمن أن شراء الألعاب الرقمية يجب أن يكون بسيطًا
            وواضحًا دون تعقيد. هدفنا أن يجد العميل اللعبة التي يبحث عنها،
            ويختار المنتج المناسب له، ثم يستلم طلبه بطريقة منظمة وسريعة.
          </p>

          <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base sm:leading-8">
            نعمل باستمرار على تطوير المتجر وإضافة ألعاب جديدة وتحسين تجربة
            الاستخدام، خصوصًا على الجوال، حتى تكون جميع خطوات الشراء سهلة من
            بداية تصفح المتجر وحتى استلام الطلب.
          </p>
        </div>

        {/* المميزات */}
        <div className="mt-6">
          <div className="mb-5">
            <p className="text-xs font-bold text-violet-400">ما يميزنا</p>
            <h3 className="mt-1 text-2xl font-black">تجربة مصممة للاعبين</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[26px] border border-white/[0.07] bg-[#111019] p-5 transition hover:-translate-y-1 hover:border-violet-400/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                ⚡
              </div>

              <h4 className="mt-4 text-lg font-black">سرعة في الخدمة</h4>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                نحرص على معالجة الطلبات وتسليمها بأسرع وقت ممكن وبطريقة واضحة.
              </p>
            </article>

            <article className="rounded-[26px] border border-white/[0.07] bg-[#111019] p-5 transition hover:-translate-y-1 hover:border-fuchsia-400/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-2xl">
                🔒
              </div>

              <h4 className="mt-4 text-lg font-black">شراء آمن</h4>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                نهتم بحماية بيانات العملاء وتقديم تجربة شراء موثوقة ومنظمة.
              </p>
            </article>

            <article className="rounded-[26px] border border-white/[0.07] bg-[#111019] p-5 transition hover:-translate-y-1 hover:border-sky-400/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl">
                💬
              </div>

              <h4 className="mt-4 text-lg font-black">دعم متعاون</h4>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                فريقنا جاهز لمساعدتك والإجابة عن استفساراتك المتعلقة بالطلبات.
              </p>
            </article>

            <article className="rounded-[26px] border border-white/[0.07] bg-[#111019] p-5 transition hover:-translate-y-1 hover:border-emerald-400/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                💰
              </div>

              <h4 className="mt-4 text-lg font-black">أسعار مناسبة</h4>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                نقدم خيارات متنوعة وأسعارًا تناسب مختلف احتياجات اللاعبين.
              </p>
            </article>
          </div>
        </div>

        {/* رؤيتنا ورسالتنا */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="relative overflow-hidden rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-violet-600/15 to-transparent p-6">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative">
              <span className="text-3xl">🚀</span>
              <h3 className="mt-4 text-xl font-black">رؤيتنا</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                أن يصبح ZETA من أفضل المتاجر الرقمية في تقديم الألعاب بسهولة
                وسرعة وتجربة استخدام مميزة.
              </p>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[28px] border border-fuchsia-400/15 bg-gradient-to-br from-fuchsia-600/15 to-transparent p-6">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-fuchsia-600/20 blur-3xl" />

            <div className="relative">
              <span className="text-3xl">🎯</span>
              <h3 className="mt-4 text-xl font-black">رسالتنا</h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                توفير ألعاب رقمية بأسعار مناسبة، وخدمة موثوقة، وتجربة سهلة
                تناسب جميع الأجهزة.
              </p>
            </div>
          </article>
        </div>

        {/* زر الرجوع */}
        <div className="mt-8 rounded-[28px] border border-white/[0.07] bg-white/[0.035] p-6 text-center">
          <h3 className="text-xl font-black">جاهز لاكتشاف الألعاب؟</h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            ارجع للمتجر وشاهد أحدث الألعاب والعروض المتوفرة.
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-black shadow-xl shadow-violet-900/30 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
          >
            العودة للمتجر
          </Link>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#0b0911] px-4 py-7 text-center">
        <p className="text-[11px] text-gray-600">
          جميع الحقوق محفوظة © 2026 ZETA
        </p>
      </footer>
    </main>
  );
}