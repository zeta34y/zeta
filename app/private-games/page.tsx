"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Game = {
  id: string;
  name: string;
  platform: string;
  price: number;
  oldPrice: number;
  category: string;
  image: string;
};

type ProductRow = {
  id: string;
  name: string;
  platform: string | null;
  price: number | string;
  old_price: number | string | null;
  cover_url: string | null;
  detail_category_label: string | null;
  short_description: string | null;
};

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function PrivateGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loadingGames, setLoadingGames] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadGames() {
      setLoadingGames(true);

      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, name, platform, price, old_price, cover_url, detail_category_label, short_description"
          )
          .eq("is_active", true)
          .eq("display_kind", "private")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!mounted) return;

        const loadedGames = ((data ?? []) as ProductRow[]).map((product) => {
          const price = toNumber(product.price);
          const oldPrice = product.old_price
            ? toNumber(product.old_price)
            : price;

          return {
            id: product.id,
            name: product.name,
            platform: product.platform || "حساب PC خاص",
            category:
              product.detail_category_label ||
              product.short_description ||
              "خاص",
            price,
            oldPrice: oldPrice > 0 ? oldPrice : price,
            image: product.cover_url || "",
          };
        });

        setGames(loadedGames);
      } catch (error) {
        console.error("تعذر تحميل الألعاب:", error);

        if (mounted) {
          setGames([]);
        }
      } finally {
        if (mounted) {
          setLoadingGames(false);
        }
      }
    }

    void loadGames();

    function refreshGames() {
      void loadGames();
    }

    window.addEventListener("focus", refreshGames);

    const channel = supabase
      .channel("zeta-private-games")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        refreshGames
      )
      .subscribe();

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshGames);
      supabase.removeChannel(channel);
    };
  }, []);

  function toggleFavorite(game: Game) {
    const favoriteId = "private-" + game.id;

    const updated = favorites.includes(favoriteId)
      ? favorites.filter((item) => item !== favoriteId)
      : [...favorites, favoriteId];

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
      const cartId = "private-" + game.id;
      const saved = localStorage.getItem("zeta_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      const cart = Array.isArray(parsed) ? parsed : [];

      const exists = cart.some(
        (item: { id: string }) => item.id === cartId
      );

      const updated = exists
        ? cart.map((item: { id: string; quantity?: number }) =>
            item.id === cartId
              ? { ...item, quantity: Number(item.quantity || 1) + 1 }
              : item
          )
        : [
            ...cart,
            {
              id: cartId,
              name: game.name,
              platform: game.platform,
              price: game.price,
              oldPrice: game.oldPrice,
              image: game.image,
              quantity: 1,
            },
          ];

      localStorage.setItem("zeta_cart", JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updated,
        })
      );

      setMessage(`تمت إضافة ${game.name} إلى السلة`);
      window.setTimeout(() => setMessage(""), 2200);
    } catch {
      setMessage("تعذر إضافة اللعبة إلى السلة");
      window.setTimeout(() => setMessage(""), 2200);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-fuchsia-700/12 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-violet-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">ألعاب PC الخاصة</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 active:scale-95"
          >
            <span>الرئيسية</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-5">
        <div className="relative overflow-hidden rounded-[32px] border border-fuchsia-400/15 bg-[radial-gradient(circle_at_75%_18%,rgba(139,92,246,0.28),transparent_35%),linear-gradient(135deg,#1a1325,#0f0c17_70%)] px-5 py-10 sm:px-8 sm:py-14">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-black text-fuchsia-300">
            ملكية خاصة 🔐
          </span>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            ألعاب PC خاصة
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
            حسابات خاصة ببيانات مستقلة وتجربة أكثر خصوصية.
          </p>
        </div>

        {loadingGames ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <div className="h-11 w-11 animate-spin rounded-full border-4 border-white/10 border-t-fuchsia-500" />
          </div>
        ) : games.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-white/[0.08] bg-white/[0.03] px-5 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
              🎮
            </div>
            <h3 className="mt-4 text-lg font-black">لا توجد ألعاب حاليًا</h3>
            <p className="mt-2 text-xs text-gray-500">
              الألعاب التي تضيفها من الإدارة لهذا القسم ستظهر هنا مباشرة.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              const discount =
                game.oldPrice > game.price && game.oldPrice > 0
                  ? Math.round(
                      ((game.oldPrice - game.price) / game.oldPrice) * 100
                    )
                  : 0;

              const favoriteId = "private-" + game.id;
              const isFavorite = favorites.includes(favoriteId);

              return (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0f0d16] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/35"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link
                      href={`/game/${game.id}`}
                      className="absolute inset-0 z-10"
                      aria-label={`عرض تفاصيل ${game.name}`}
                    />

                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl transition duration-300 group-hover:scale-105">
                        🎮
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111019] via-transparent to-transparent" />

                    {discount > 0 && (
                      <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black">
                        -{discount}%
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(game);
                      }}
                      className={`absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md ${
                        isFavorite
                          ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
                          : "border-white/10 bg-black/40 text-white"
                      }`}
                    >
                      {isFavorite ? "♥" : "♡"}
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-[9px] font-bold text-fuchsia-300">
                      {game.platform}
                    </p>

                    <Link
                      href={`/game/${game.id}`}
                      className="mt-1 block truncate text-sm font-black"
                    >
                      {game.name}
                    </Link>

                    <p className="mt-1 truncate text-[9px] text-gray-500">
                      {game.category}
                    </p>

                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-base font-black">
                          {game.price}
                          <span className="mr-1 text-[9px] text-gray-500">
                            ر.س
                          </span>
                        </p>

                        {game.oldPrice > game.price && (
                          <p className="text-[9px] text-gray-600 line-through">
                            {game.oldPrice} ر.س
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(game)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-600 text-lg font-black active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
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
    </main>
  );
}