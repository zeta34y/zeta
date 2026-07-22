"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";

type CategoryInfo = {
  name: string;
  icon: string;
  description: string;
};

type Game = {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  oldPrice: number;
};

const categoryInfo: Record<string, CategoryInfo> = {
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

const allGames: Game[] = [
  {
    id: "featured-1",
    name: "EA SPORTS FC 26",
    type: "نسخة رقمية",
    category: "sports",
    price: 189,
    oldPrice: 249,
  },
  {
    id: "shared-1",
    name: "EA SPORTS FC",
    type: "حساب PC مشترك",
    category: "sports",
    price: 29,
    oldPrice: 49,
  },
  {
    id: "featured-2",
    name: "Call of Duty",
    type: "نسخة رقمية",
    category: "action",
    price: 159,
    oldPrice: 219,
  },
  {
    id: "private-1",
    name: "Call of Duty",
    type: "حساب PC خاص",
    category: "action",
    price: 149,
    oldPrice: 199,
  },
  {
    id: "featured-3",
    name: "Grand Theft Auto V",
    type: "نسخة رقمية",
    category: "simulation",
    price: 79,
    oldPrice: 129,
  },
  {
    id: "shared-2",
    name: "GTA V",
    type: "حساب PC مشترك",
    category: "simulation",
    price: 19,
    oldPrice: 39,
  },
  {
    id: "featured-4",
    name: "Forza Horizon",
    type: "نسخة رقمية",
    category: "simulation",
    price: 139,
    oldPrice: 199,
  },
  {
    id: "shared-3",
    name: "Forza Horizon",
    type: "حساب PC مشترك",
    category: "simulation",
    price: 35,
    oldPrice: 59,
  },
  {
    id: "private-2",
    name: "Red Dead Redemption",
    type: "حساب PC خاص",
    category: "adventure",
    price: 119,
    oldPrice: 169,
  },
  {
    id: "private-3",
    name: "Cyber Adventure",
    type: "حساب PC خاص",
    category: "adventure",
    price: 89,
    oldPrice: 129,
  },
  {
    id: "featured-2",
    name: "Call of Duty",
    type: "نسخة رقمية",
    category: "horror",
    price: 159,
    oldPrice: 219,
  },
  {
    id: "private-3",
    name: "Cyber Adventure",
    type: "حساب PC خاص",
    category: "2d",
    price: 89,
    oldPrice: 129,
  },
];

export default function CategoryDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const current = categoryInfo[slug] ?? {
    name: "التصنيف",
    icon: "🎮",
    description: "الألعاب الموجودة في هذا التصنيف",
  };

  const games = useMemo(
    () => allGames.filter((game) => game.category === slug),
    [slug]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2200);
  }

  function toggleFavorite(gameId: string) {
    const updated = favorites.includes(gameId)
      ? favorites.filter((id) => id !== gameId)
      : [...favorites, gameId];

    setFavorites(updated);
    localStorage.setItem("zeta_favorites", JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent("zeta-favorites-updated", {
        detail: updated,
      })
    );
  }

  function addToCart(game: Game) {
    try {
      const saved = localStorage.getItem("zeta_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      const cart = Array.isArray(parsed) ? parsed : [];

      const exists = cart.some(
        (item: { id: string }) => item.id === game.id
      );

      const updated = exists
        ? cart.map(
            (item: {
              id: string;
              quantity?: number;
            }) =>
              item.id === game.id
                ? {
                    ...item,
                    quantity: Number(item.quantity || 1) + 1,
                  }
                : item
          )
        : [
            ...cart,
            {
              id: game.id,
              name: game.name,
              platform: game.type,
              price: game.price,
              oldPrice: game.oldPrice,
              quantity: 1,
              image: "",
            },
          ];

      localStorage.setItem("zeta_cart", JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updated,
        })
      );

      showMessage(`تمت إضافة ${game.name} إلى السلة`);
    } catch {
      showMessage("تعذر إضافة اللعبة إلى السلة");
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-32 text-white"
    >
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#08070d]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black shadow-lg shadow-violet-900/30 sm:h-11 sm:w-11 sm:text-xl">
              Z
            </div>

            <div>
              <h1 className="text-base font-black tracking-wider sm:text-lg">
                ZETA
              </h1>
              <p className="text-[9px] text-gray-500 sm:text-[10px]">
                متجر الألعاب الرقمية
              </p>
            </div>
          </Link>

          <Link
            href="/categories"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-95 sm:h-10 sm:rounded-2xl sm:px-3.5 sm:text-[11px]"
          >
            <span>التصنيفات</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-br from-violet-700/25 via-[#100d18] to-fuchsia-700/10 p-4 sm:rounded-[30px] sm:p-5">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/10 bg-gradient-to-br from-violet-600/40 to-fuchsia-600/20 text-3xl sm:h-20 sm:w-20 sm:rounded-[26px] sm:text-4xl">
              {current.icon}
            </div>

            <div>
              <p className="text-[9px] font-bold text-violet-300 sm:text-[10px]">
                التصنيف المختار
              </p>

              <h1 className="mt-1 text-xl font-black sm:text-3xl">
                {current.name}
              </h1>

              <p className="mt-1 text-xs leading-5 text-gray-400 sm:mt-2 sm:text-sm sm:leading-6">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between sm:mt-7">
          <div>
            <p className="text-[9px] font-bold text-violet-400 sm:text-[10px]">
              الألعاب
            </p>
            <h2 className="mt-1 text-lg font-black sm:text-xl">
              {current.name}
            </h2>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1.5 text-[9px] text-gray-400 sm:text-[10px]">
            {games.length} ألعاب
          </span>
        </div>

        {games.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              const discount = Math.round(
                ((game.oldPrice - game.price) / game.oldPrice) * 100
              );

              return (
                <article
                  key={`${game.id}-${game.category}`}
                  className="group overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30 sm:rounded-[22px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link
                      href={`/game/${game.id}`}
                      aria-label={`عرض تفاصيل ${game.name}`}
                      className="absolute inset-0 z-10"
                    />

                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-4xl transition duration-300 group-hover:scale-105 sm:text-5xl">
                      🎮
                    </div>

                    <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[8px] font-black sm:text-[9px]">
                      -{discount}%
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(game.id)}
                      aria-label={`إضافة ${game.name} للمفضلة`}
                      className={`absolute left-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border text-base backdrop-blur-md transition active:scale-90 sm:h-9 sm:w-9 ${
                        favorites.includes(game.id)
                          ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
                          : "border-white/10 bg-black/40 text-white"
                      }`}
                    >
                      {favorites.includes(game.id) ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-[8px] font-bold text-violet-400 sm:text-[9px]">
                      {game.type}
                    </p>

                    <Link
                      href={`/game/${game.id}`}
                      className="mt-1 block truncate text-xs font-black transition hover:text-violet-300 sm:text-sm"
                    >
                      {game.name}
                    </Link>

                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-base font-black">
                          {game.price}
                          <span className="mr-1 text-[8px] text-gray-500 sm:text-[9px]">
                            ر.س
                          </span>
                        </p>

                        <p className="text-[8px] text-gray-600 line-through sm:text-[9px]">
                          {game.oldPrice} ر.س
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(game)}
                        aria-label={`إضافة ${game.name} للسلة`}
                        className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-black shadow-lg transition active:scale-90 sm:h-10 sm:w-10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] border border-white/[0.07] bg-white/[0.03] px-5 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
              🎮
            </div>

            <h3 className="mt-4 text-lg font-black">
              لا توجد ألعاب حاليًا
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              سيتم إضافة ألعاب جديدة قريبًا
            </p>
          </div>
        )}
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-violet-300/20 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}

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