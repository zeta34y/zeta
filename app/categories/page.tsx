"use client";

import Link from "next/link";

type Category = {
  name: string;
  slug: string;
  icon: string;
  description: string;
};

const categories: Category[] = [
  {
    name: "ألعاب المحاكاة",
    slug: "simulation",
    icon: "🕹️",
    description: "قيادة، حياة، بناء وإدارة",
  },
  {
    name: "ألعاب الرياضة",
    slug: "sports",
    icon: "⚽",
    description: "كرة قدم ورياضات متنوعة",
  },
  {
    name: "ألعاب الأكشن",
    slug: "action",
    icon: "🔥",
    description: "قتال، إطلاق نار وحماس",
  },
  {
    name: "ألعاب 2D",
    slug: "2d",
    icon: "👾",
    description: "ألعاب ثنائية الأبعاد",
  },
  {
    name: "ألعاب المغامرات",
    slug: "adventure",
    icon: "🗺️",
    description: "استكشاف وقصص وعوالم",
  },
  {
    name: "ألعاب الرعب",
    slug: "horror",
    icon: "👻",
    description: "رعب وتشويق وبقاء",
  },
];

export default function CategoriesPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-28 text-white"
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[9px] text-gray-500">متجر الألعاب الرقمية</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] font-bold text-gray-300 transition hover:border-violet-400/40 hover:text-white active:scale-95"
          >
            العودة للرئيسية
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-7">
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-gradient-to-br from-violet-700/20 via-[#100d18] to-fuchsia-700/10 px-5 py-7 text-center">
          <div className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-violet-600/20 blur-[70px]" />
          <div className="absolute -bottom-16 -right-12 h-44 w-44 rounded-full bg-fuchsia-600/15 blur-[70px]" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-bold text-violet-300">
              اختر لعبتك
            </span>

            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              كل التصنيفات
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              اختر قسمًا لعرض ألعابه
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#100d18] p-5 shadow-xl transition duration-300 hover:-translate-y-1.5 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30 active:scale-[0.98]"
            >
              <div className="absolute -left-10 -top-12 h-36 w-36 rounded-full bg-violet-600/10 blur-3xl transition duration-300 group-hover:bg-violet-600/20" />

              <div className="relative flex items-center gap-4">
                <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[24px] border border-white/10 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-4xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:from-violet-600/50 group-hover:to-fuchsia-600/35">
                  {category.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black leading-tight">
                    {category.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {category.description}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-violet-300 transition duration-300 group-hover:-translate-x-1 group-hover:border-violet-400/30 group-hover:bg-violet-500/10">
                  ←
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* القائمة السفلية العائمة */}
      <nav className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-md rounded-[28px] border border-violet-300/20 bg-gradient-to-l from-violet-700/95 via-fuchsia-600/95 to-violet-700/95 p-2 shadow-[0_18px_50px_rgba(76,29,149,0.48)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          <button
            aria-label="الرئيسية"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] bg-white/15 text-white shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[24px] w-[24px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.7 12 3.8l8.5 6.9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9.7v9.2h13V9.7M9.2 18.9v-5.4h5.6v5.4" />
            </svg>
            <span className="text-[9px] font-black">الرئيسية</span>
          </button>

          <Link
            href="/categories"
            aria-label="التصنيفات"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" />
              <rect x="14" y="3.5" width="6.5" height="6.5" rx="2" />
              <rect x="3.5" y="14" width="6.5" height="6.5" rx="2" />
              <rect x="14" y="14" width="6.5" height="6.5" rx="2" />
            </svg>
            <span className="text-[9px] font-black">التصنيفات</span>
          </Link>

          <button
            aria-label="السلة"
            className="group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 4.5h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4l1.4-5.3H7" />
              <circle cx="9.5" cy="19.2" r="1.2" />
              <circle cx="17.2" cy="19.2" r="1.2" />
            </svg>
            <span className="absolute right-[24%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
              0
            </span>
            <span className="text-[9px] font-black">السلة</span>
          </button>

          <button
            aria-label="تسجيل الدخول"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <circle cx="12" cy="7.2" r="3.2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.8 20c.5-4 2.8-6.2 6.2-6.2s5.7 2.2 6.2 6.2" />
            </svg>
            <span className="text-[9px] font-black">الدخول</span>
          </button>

          <button
            aria-label="البحث"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <circle cx="10.8" cy="10.8" r="5.8" />
              <path strokeLinecap="round" d="m15.2 15.2 4.3 4.3" />
            </svg>
            <span className="text-[9px] font-black">بحث</span>
          </button>
        </div>
      </nav>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #08070d;
        }

        body {
          margin: 0;
          overflow-x: hidden;
          background: #08070d;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
        }

      `}</style>
    </main>
  );
}