"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";

type PackageGame = {
  id: number;
  name: string;
  platform: string;
  price: number;
  oldPrice: number;
  image: string;
  gamesCount: number;
};

const packageGames: PackageGame[] = [
  {
    id: 1,
    name: "بكج الأكشن",
    platform: "ألعاب PC",
    price: 99,
    oldPrice: 159,
    image: "",
    gamesCount: 3,
  },
  {
    id: 2,
    name: "بكج العالم المفتوح",
    platform: "ألعاب PC",
    price: 119,
    oldPrice: 189,
    image: "",
    gamesCount: 3,
  },
  {
    id: 3,
    name: "بكج الرياضة والسباقات",
    platform: "ألعاب PC",
    price: 129,
    oldPrice: 209,
    image: "",
    gamesCount: 4,
  },
  {
    id: 4,
    name: "بكج المغامرات",
    platform: "ألعاب PC",
    price: 109,
    oldPrice: 179,
    image: "",
    gamesCount: 3,
  },
];

export default function PackagesPage() {
  const [addingId, setAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

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

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  function addToCart(game: PackageGame) {
    try {
      const cartId = `package-${game.id}`;
      const saved = localStorage.getItem("zeta_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      const cart = Array.isArray(parsed) ? parsed : [];

      const exists = cart.some(
        (item: { id: string }) => item.id === cartId
      );

      const updatedCart = exists
        ? cart.map(
            (item: {
              id: string;
              quantity?: number;
            }) =>
              item.id === cartId
                ? {
                    ...item,
                    quantity: Number(item.quantity || 1) + 1,
                  }
                : item
          )
        : [
            ...cart,
            {
              id: cartId,
              name: game.name,
              platform: `${game.gamesCount} ألعاب PC`,
              price: game.price,
              oldPrice: game.oldPrice,
              image: game.image,
              quantity: 1,
            },
          ];

      localStorage.setItem(
        "zeta_cart",
        JSON.stringify(updatedCart)
      );

      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updatedCart,
        })
      );

      setAddingId(game.id);
      showMessage(`تمت إضافة ${game.name} إلى السلة`);

      window.setTimeout(() => {
        setAddingId(null);
      }, 600);
    } catch {
      showMessage("تعذر إضافة البكج إلى السلة");
    }
  }

  function toggleFavorite(game: PackageGame) {
    const favoriteId = `package-${game.id}`;

    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      const current = Array.isArray(parsed) ? parsed : [];

      const updated = current.includes(favoriteId)
        ? current.filter((id: string) => id !== favoriteId)
        : [...current, favoriteId];

      setFavorites(updated);

      localStorage.setItem(
        "zeta_favorites",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new CustomEvent("zeta-favorites-updated", {
          detail: updated,
        })
      );

      showMessage(
        updated.includes(favoriteId)
          ? `تمت إضافة ${game.name} إلى المفضلة`
          : `تمت إزالة ${game.name} من المفضلة`
      );
    } catch {
      showMessage("تعذر تحديث المفضلة");
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-32 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-amber-600/10 blur-[130px]" />
        <div className="absolute -left-32 top-[500px] h-[380px] w-[380px] rounded-full bg-violet-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black shadow-lg shadow-violet-950/30 sm:h-11 sm:w-11 sm:text-xl">
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
            href="/"
            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-95 sm:h-10 sm:rounded-2xl sm:text-[11px]"
          >
            <span>الرئيسية</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-7">
        <div className="relative overflow-hidden rounded-[26px] border border-amber-400/15 bg-gradient-to-br from-amber-600/20 via-[#14101b] to-violet-700/15 p-5 sm:rounded-[32px] sm:p-7">
          <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-amber-300/15 bg-amber-500/10 text-3xl sm:h-20 sm:w-20 sm:rounded-[26px] sm:text-4xl">
              🎁
            </div>

            <div>
              <p className="text-[9px] font-bold text-amber-300 sm:text-[10px]">
                وفر أكثر
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-4xl">
                بكجات الألعاب
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-6 text-gray-400 sm:text-sm">
                أكثر من لعبة داخل بكج واحد بسعر أقل من شراء كل لعبة
                بشكل منفصل.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <p className="text-[9px] font-bold text-amber-400 sm:text-[10px]">
              جميع البكجات
            </p>

            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              اختر البكج المناسب لك
            </h2>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1.5 text-[9px] text-gray-400 sm:text-[10px]">
            {packageGames.length} بكجات
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {packageGames.map((game) => {
            const discount = Math.round(
              ((game.oldPrice - game.price) / game.oldPrice) * 100
            );

            const favoriteId = `package-${game.id}`;
            const isFavorite = favorites.includes(favoriteId);

            return (
              <article
                key={game.id}
                className="group overflow-hidden rounded-[20px] border border-amber-400/10 bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-950/20 sm:rounded-[24px]"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Link
                    href={`/game/package-${game.id}`}
                    aria-label={`عرض تفاصيل ${game.name}`}
                    className="absolute inset-0 z-10"
                  />

                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-700/20 via-violet-700/15 to-fuchsia-700/20 text-5xl transition duration-300 group-hover:scale-105">
                      🎁
                    </div>
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121019] via-transparent to-transparent" />

                  <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-gradient-to-l from-amber-500 to-orange-600 px-2 py-1 text-[9px] font-black text-white">
                    -{discount}%
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleFavorite(game);
                    }}
                    aria-label={
                      isFavorite
                        ? `إزالة ${game.name} من المفضلة`
                        : `إضافة ${game.name} للمفضلة`
                    }
                    className={`absolute left-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur-md transition active:scale-90 sm:h-9 sm:w-9 ${
                      isFavorite
                        ? "border-rose-400/40 bg-rose-500/25 text-rose-300"
                        : "border-white/10 bg-black/40 text-white"
                    }`}
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>

                  <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-xl border border-white/10 bg-black/50 px-2.5 py-1.5 text-[9px] font-black backdrop-blur-md">
                    {game.gamesCount} ألعاب
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="text-[8px] font-bold text-amber-400 sm:text-[10px]">
                    {game.platform}
                  </p>

                  <Link
                    href={`/game/package-${game.id}`}
                    className="mt-1 block truncate text-xs font-black transition hover:text-amber-300 sm:text-sm"
                  >
                    {game.name}
                  </Link>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-base font-black sm:text-lg">
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
                      className={`relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg font-black text-white shadow-lg transition active:scale-90 sm:h-10 sm:w-10 ${
                        addingId === game.id
                          ? "rotate-12 scale-90 brightness-125"
                          : ""
                      }`}
                    >
                      {addingId === game.id ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-amber-300/20 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}