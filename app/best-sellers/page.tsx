"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";

type Game = {
  id: string;
  name: string;
  label: string;
  platform: string;
  category: string;
  price: number;
  oldPrice: number;
  sales: number;
};

const games: Game[] = [
  {
    id: "featured-1",
    name: "EA SPORTS FC 26",
    label: "نسخة رقمية",
    platform: "PC",
    category: "رياضة",
    price: 189,
    oldPrice: 249,
    sales: 1240,
  },
  {
    id: "shared-2",
    name: "GTA V",
    label: "حساب PC مشترك",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 19,
    oldPrice: 39,
    sales: 1125,
  },
  {
    id: "featured-2",
    name: "Call of Duty",
    label: "نسخة رقمية",
    platform: "PC",
    category: "أكشن",
    price: 159,
    oldPrice: 219,
    sales: 980,
  },
  {
    id: "shared-3",
    name: "Forza Horizon",
    label: "حساب PC مشترك",
    platform: "Xbox PC",
    category: "سباقات",
    price: 35,
    oldPrice: 59,
    sales: 860,
  },
  {
    id: "private-2",
    name: "Red Dead Redemption",
    label: "حساب PC خاص",
    platform: "حساب خاص",
    category: "مغامرات",
    price: 119,
    oldPrice: 169,
    sales: 720,
  },
  {
    id: "featured-3",
    name: "Grand Theft Auto V",
    label: "نسخة رقمية",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 79,
    oldPrice: 129,
    sales: 690,
  },
];

export default function BestSellersPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<"sales" | "price-low" | "price-high">(
    "sales"
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const ids = saved ? JSON.parse(saved) : [];
      setFavorites(Array.isArray(ids) ? ids : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const sortedGames = useMemo(() => {
    const copied = [...games];

    if (sort === "price-low") {
      return copied.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      return copied.sort((a, b) => b.price - a.price);
    }

    return copied.sort((a, b) => b.sales - a.sales);
  }, [sort]);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2200);
  }

  function toggleFavorite(id: string) {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

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
      const cart = saved ? JSON.parse(saved) : [];
      const safeCart = Array.isArray(cart) ? cart : [];

      const exists = safeCart.some(
        (item: { id: string }) => item.id === game.id
      );

      const updatedCart = exists
        ? safeCart.map((item: { id: string; quantity?: number }) =>
            item.id === game.id
              ? { ...item, quantity: Number(item.quantity || 1) + 1 }
              : item
          )
        : [
            ...safeCart,
            {
              id: game.id,
              name: game.name,
              price: game.price,
              oldPrice: game.oldPrice,
              platform: game.platform,
              quantity: 1,
              image: "",
            },
          ];

      localStorage.setItem("zeta_cart", JSON.stringify(updatedCart));

      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updatedCart,
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
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-orange-600/10 blur-[130px]" />
        <div className="absolute -left-32 top-[500px] h-[380px] w-[380px] rounded-full bg-violet-700/12 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">
                ZETA
              </h1>
              <p className="text-[10px] text-gray-500">
                الألعاب الأكثر مبيعًا
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span>الرئيسية</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-5">
        <div className="relative overflow-hidden rounded-[32px] border border-orange-400/15 bg-[radial-gradient(circle_at_75%_18%,rgba(249,115,22,0.25),transparent_34%),linear-gradient(135deg,#1a1110,#100d18_68%)] px-5 py-10 shadow-2xl shadow-orange-950/10 sm:px-8 sm:py-14">
          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-black text-orange-300">
              <span>🔥</span>
              الأكثر طلبًا
            </span>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              الألعاب التي يختارها
              <span className="block bg-gradient-to-l from-orange-300 to-violet-400 bg-clip-text text-transparent">
                عملاء ZETA
              </span>
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
              مجموعة مرتبة حسب الأكثر شراءً وطلبًا داخل المتجر.
            </p>
          </div>

          <div className="absolute bottom-5 left-6 hidden h-36 w-36 rotate-6 items-center justify-center rounded-[36px] border border-white/10 bg-white/5 text-6xl backdrop-blur-xl sm:flex">
            🏆
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-orange-400">
              ترتيب المنتجات
            </p>
            <h2 className="mt-1 text-2xl font-black">
              الأكثر مبيعًا
            </h2>
          </div>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as
                  | "sales"
                  | "price-low"
                  | "price-high"
              )
            }
            className="rounded-2xl border border-white/10 bg-[#15121d] px-3 py-2.5 text-[11px] font-black text-white outline-none"
          >
            <option value="sales">الأكثر مبيعًا</option>
            <option value="price-low">السعر: الأقل</option>
            <option value="price-high">السعر: الأعلى</option>
          </select>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sortedGames.map((game, index) => {
            const discount = Math.round(
              ((game.oldPrice - game.price) / game.oldPrice) * 100
            );

            return (
              <article
                key={game.id}
                className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0f0d16] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-2xl hover:shadow-orange-950/10"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Link
                    href={`/game/${game.id}`}
                    aria-label={`عرض تفاصيل ${game.name}`}
                    className="absolute inset-0 z-10"
                  />

                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-orange-700/15 text-5xl transition duration-300 group-hover:scale-105">
                    🎮
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111019] via-transparent to-transparent" />

                  <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-black">
                    #{index + 1}
                  </span>

                  <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black">
                    -{discount}%
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleFavorite(game.id)}
                    aria-label={`إضافة ${game.name} للمفضلة`}
                    className={`absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition active:scale-90 ${
                      favorites.includes(game.id)
                        ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
                        : "border-white/10 bg-black/40 text-white"
                    }`}
                  >
                    {favorites.includes(game.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="p-3">
                  <p className="text-[9px] font-bold text-orange-400">
                    {game.label}
                  </p>

                  <Link
                    href={`/game/${game.id}`}
                    className="mt-1 block line-clamp-1 text-sm font-black transition hover:text-orange-300"
                  >
                    {game.name}
                  </Link>

                  <p className="mt-1 line-clamp-1 text-[9px] text-gray-500">
                    {game.platform}
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-base font-black">
                        {game.price}
                        <span className="mr-1 text-[9px] text-gray-500">
                          ر.س
                        </span>
                      </p>

                      <p className="text-[9px] text-gray-600 line-through">
                        {game.oldPrice} ر.س
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(game)}
                      aria-label={`إضافة ${game.name} للسلة`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-violet-600 text-lg font-black shadow-lg transition active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/[0.06] pt-3 text-[9px] text-gray-600">
                    <span>🔥</span>
                    <span>{game.sales.toLocaleString("en-US")} عملية شراء</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-violet-300/20 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}