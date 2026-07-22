"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const categoryInfo: Record<
  string,
  { name: string; icon: string; description: string }
> = {
  simulation: {
    name: "ألعاب المحاكاة",
    icon: "🕹️",
    description: "قيادة، حياة، بناء وإدارة",
  },
  sports: {
    name: "ألعاب الرياضة",
    icon: "⚽",
    description: "كرة قدم ورياضات متنوعة",
  },
  action: {
    name: "ألعاب الأكشن",
    icon: "🔥",
    description: "قتال، إطلاق نار وحماس",
  },
  "2d": {
    name: "ألعاب 2D",
    icon: "👾",
    description: "ألعاب ثنائية الأبعاد",
  },
  adventure: {
    name: "ألعاب المغامرات",
    icon: "🗺️",
    description: "استكشاف وقصص وعوالم",
  },
  horror: {
    name: "ألعاب الرعب",
    icon: "👻",
    description: "رعب وتشويق وبقاء",
  },
};

const placeholderGames = [
  { id: 1, name: "لعبة قادمة", type: "Steam PC" },
  { id: 2, name: "لعبة قادمة", type: "حساب خاص" },
  { id: 3, name: "لعبة قادمة", type: "حساب مشترك" },
  { id: 4, name: "لعبة قادمة", type: "PC" },
];

export default function CategoryDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const current = categoryInfo[slug] ?? {
    name: "التصنيف",
    icon: "🎮",
    description: "الألعاب الموجودة في هذا التصنيف",
  };

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
              <p className="text-[10px] text-gray-500">متجر الألعاب الرقمية</p>
            </div>
          </Link>

          <Link
            href="/categories"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 transition hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-95"
          >
            <span>التصنيفات</span>

            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 6-6 6 6 6"
              />
            </svg>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-[30px] border border-white/[0.06] bg-gradient-to-br from-violet-700/25 via-[#100d18] to-fuchsia-700/10 p-5">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border border-white/10 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 text-4xl">
              {current.icon}
            </div>

            <div>
              <p className="text-[10px] font-bold text-violet-300">
                التصنيف المختار
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-3xl">
                {current.name}
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-violet-400">الألعاب</p>
            <h2 className="mt-1 text-xl font-black">{current.name}</h2>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] text-gray-400">
            {placeholderGames.length} ألعاب
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {placeholderGames.map((game) => (
            <article
              key={game.id}
              className="group overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30"
            >
              <div className="flex aspect-[4/5] items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl">
                🎮
              </div>

              <div className="p-3">
                <p className="text-[9px] font-bold text-violet-400">
                  {game.type}
                </p>

                <h3 className="mt-1 text-sm font-black">{game.name}</h3>

                <p className="mt-3 text-[10px] font-bold text-violet-300">
                  السعر قريبًا
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <BottomNav />

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          overflow-x: hidden;
          background: #08070d;
        }

      `}</style>
    </main>
  );
}