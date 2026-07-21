"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type CategorySlug =
  | "simulation"
  | "sports"
  | "2d"
  | "adventure"
  | "horror";

type Category = {
  name: string;
  slug: CategorySlug;
  icon: string;
  description: string;
};

type Game = {
  id: number;
  name: string;
  type: string;
  category: CategorySlug;
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

const games: Game[] = [
  {
    id: 1,
    name: "لعبة محاكاة قادمة",
    type: "PC",
    category: "simulation",
  },
  {
    id: 2,
    name: "لعبة قيادة قادمة",
    type: "Steam PC",
    category: "simulation",
  },
  {
    id: 3,
    name: "لعبة رياضية قادمة",
    type: "PC",
    category: "sports",
  },
  {
    id: 4,
    name: "لعبة كرة قدم قادمة",
    type: "حساب خاص",
    category: "sports",
  },
  {
    id: 5,
    name: "لعبة 2D قادمة",
    type: "PC",
    category: "2d",
  },
  {
    id: 6,
    name: "لعبة مغامرات قادمة",
    type: "Steam PC",
    category: "adventure",
  },
  {
    id: 7,
    name: "لعبة رعب قادمة",
    type: "PC",
    category: "horror",
  },
  {
    id: 8,
    name: "لعبة بقاء قادمة",
    type: "حساب مشترك",
    category: "horror",
  },
];

export default function CategoriesPage() {
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] =
    useState<CategorySlug | null>(
      (searchParams.get("category") as CategorySlug | null) ?? null
    );

  const selectedInfo = useMemo(
    () =>
      categories.find((category) => category.slug === selectedCategory) ?? null,
    [selectedCategory]
  );

  const filteredGames = useMemo(
    () =>
      selectedCategory
        ? games.filter((game) => game.category === selectedCategory)
        : [],
    [selectedCategory]
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-28 text-white"
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[9px] text-gray-500">متجر الألعاب الرقمية</p>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-bold text-gray-300 transition hover:border-violet-400/40 hover:text-white active:scale-95"
          >
            العودة للرئيسية
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-4 px-3 py-5 sm:px-4">
        {/* القائمة الجانبية */}
        <aside className="sticky top-[78px] h-fit w-[122px] shrink-0 rounded-[24px] border border-white/[0.07] bg-[#0d0a14] p-2 shadow-xl sm:w-[230px] sm:p-3">
          <div className="px-2 pb-3 pt-2">
            <h2 className="text-[12px] font-black sm:text-lg">كل التصنيفات</h2>
            <p className="mt-1 hidden text-[10px] text-gray-500 sm:block">
              اختر قسمًا لعرض ألعابه
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category.slug;

              return (
                <button
                  key={category.slug}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`group flex w-full items-center gap-2 rounded-[18px] border p-2 text-right transition duration-200 sm:gap-3 sm:p-3 ${
                    isActive
                      ? "border-violet-400/50 bg-gradient-to-l from-violet-600/25 to-fuchsia-600/15 shadow-lg shadow-violet-950/30"
                      : "border-white/[0.05] bg-white/[0.025] hover:-translate-x-1 hover:border-violet-400/30 hover:bg-violet-500/10"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-base sm:h-11 sm:w-11 sm:text-xl ${
                      isActive
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600"
                        : "bg-gradient-to-br from-violet-600/25 to-fuchsia-600/15"
                    }`}
                  >
                    {category.icon}
                  </span>

                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-[10px] font-black leading-4 sm:text-sm">
                      {category.name}
                    </h3>

                    <p className="mt-1 hidden line-clamp-1 text-[9px] text-gray-500 sm:block">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* مكان عرض الألعاب */}
        <section className="min-w-0 flex-1">
          {!selectedInfo ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-violet-700/10 via-transparent to-fuchsia-700/10 p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-4xl">
                🎮
              </div>

              <h1 className="mt-5 text-xl font-black sm:text-2xl">
                اختر تصنيفًا
              </h1>

            </div>
          ) : (
            <div
              key={selectedInfo.slug}
              className="animate-category rounded-[28px] border border-white/[0.06] bg-[#0d0a14]/70 p-3 sm:p-5"
            >
              <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-700/25 via-fuchsia-700/10 to-transparent p-4 sm:p-5">
                <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl" />

                <div className="relative flex items-center gap-3 sm:gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 text-3xl sm:h-16 sm:w-16">
                    {selectedInfo.icon}
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-violet-300 sm:text-[10px]">
                      التصنيف المختار
                    </p>

                    <h1 className="mt-1 text-lg font-black sm:text-2xl">
                      {selectedInfo.name}
                    </h1>

                    <p className="mt-1 text-[10px] leading-5 text-gray-400 sm:text-[11px]">
                      {selectedInfo.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-violet-400">
                    الألعاب المتوفرة
                  </p>

                  <h2 className="mt-1 text-base font-black sm:text-lg">
                    {selectedInfo.name}
                  </h2>
                </div>

                <span className="rounded-full bg-white/5 px-3 py-1.5 text-[9px] text-gray-400">
                  {filteredGames.length} ألعاب
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                {filteredGames.map((game) => (
                  <article
                    key={game.id}
                    className="group overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30"
                  >
                    <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-4xl sm:text-5xl">
                      🎮
                    </div>

                    <div className="p-2.5 sm:p-3">
                      <p className="text-[8px] font-bold text-violet-400 sm:text-[9px]">
                        {game.type}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-[11px] font-black sm:text-sm">
                        {game.name}
                      </h3>

                      <p className="mt-3 text-[9px] font-bold text-violet-300 sm:text-[10px]">
                        السعر قريبًا
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <nav className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-md rounded-[28px] border border-violet-300/20 bg-gradient-to-l from-violet-700/95 via-fuchsia-600/95 to-violet-700/95 p-2 shadow-[0_18px_50px_rgba(76,29,149,0.48)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          <Link href="/" className="nav-item">
            <span className="text-[20px]">⌂</span>
            <span className="text-[9px] font-black">الرئيسية</span>
          </Link>

          <button className="nav-item nav-active">
            <span className="text-[20px]">▦</span>
            <span className="text-[9px] font-black">التصنيفات</span>
          </button>

          <button className="nav-item">
            <span className="text-[20px]">🛒</span>
            <span className="text-[9px] font-black">السلة</span>
          </button>

          <button className="nav-item">
            <span className="text-[20px]">♙</span>
            <span className="text-[9px] font-black">الدخول</span>
          </button>

          <button className="nav-item">
            <span className="text-[20px]">⌕</span>
            <span className="text-[9px] font-black">بحث</span>
          </button>
        </div>
      </nav>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #08070d;
        }

        .nav-item {
          display: flex;
          min-height: 58px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.84);
          transition: 0.2s ease;
        }

        .nav-item:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.14);
          color: white;
          box-shadow: 0 14px 28px rgba(139, 92, 246, 0.55);
        }

        .nav-active {
          background: rgba(255, 255, 255, 0.16);
          color: white;
        }

        .animate-category {
          animation: categoryIn 320ms ease both;
        }

        @keyframes categoryIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}