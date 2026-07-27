"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type ProductData = {
  id: string;
  name: string;
  short_description: string | null;
  platform: string | null;
  price: number;
  old_price: number | null;
  discount_percent: number | null;
  cover_url: string | null;
  is_shared: boolean;
  sold_count: number | null;
};

type OfferRow = {
  id: string;
  product_id: string | null;
  products: ProductData | null;
};

type BestSellerGame = {
  offerId: string;
  id: string;
  name: string;
  label: string;
  platform: string;
  price: number;
  oldPrice: number;
  discountPercent: number;
  image: string;
  soldCount: number;
};

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function BestSellersPage() {
  const [games, setGames] = useState<BestSellerGame[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("zeta_favorites");
      const parsedFavorites = savedFavorites
        ? JSON.parse(savedFavorites)
        : [];

      setFavorites(
        Array.isArray(parsedFavorites) ? parsedFavorites : []
      );
    } catch {
      setFavorites([]);
    }

    void loadBestSellers();
  }, []);

  async function loadBestSellers() {
    setLoading(true);

    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("offers")
        .select(
          `
            id,
            product_id,
            products (
              id,
              name,
              short_description,
              platform,
              price,
              old_price,
              discount_percent,
              cover_url,
              is_shared,
              sold_count
            )
          `
        )
        .eq("is_active", true)
        .not("product_id", "is", null)
        .lte("starts_at", now)
        .or(`ends_at.is.null,ends_at.gt.${now}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as unknown as OfferRow[];

      const uniqueProducts = new Map<string, BestSellerGame>();

      for (const row of rows) {
        const product = row.products;

        if (!product) continue;

        const realPrice = toNumber(product.price);
        const oldPrice = toNumber(product.old_price);
        const soldCount = Math.max(
          0,
          Math.floor(toNumber(product.sold_count))
        );
        const discountPercent = Math.max(
          0,
          Math.min(
            100,
            Math.floor(toNumber(product.discount_percent))
          )
        );

        const mapped: BestSellerGame = {
          offerId: row.id,
          id: product.id,
          name: product.name,
          label:
            product.short_description ||
            (product.is_shared
              ? "حساب PC مشترك"
              : "حساب PC خاص"),
          platform: product.platform || "PC",
          price: Math.round(realPrice * 100) / 100,
          oldPrice:
            oldPrice > realPrice
              ? Math.round(oldPrice * 100) / 100
              : 0,
          discountPercent,
          image: product.cover_url || "",
          soldCount,
        };

        const current = uniqueProducts.get(product.id);

        if (!current || mapped.soldCount > current.soldCount) {
          uniqueProducts.set(product.id, mapped);
        }
      }

      const bestSellers = [...uniqueProducts.values()]
        .filter((game) => game.soldCount > 0)
        .sort(
          (first, second) =>
            second.soldCount - first.soldCount
        )
        .slice(0, 8);

      setGames(bestSellers);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  const totalSales = useMemo(
    () =>
      games.reduce(
        (total, game) => total + game.soldCount,
        0
      ),
    [games]
  );

  function showMessage(value: string) {
    setMessage(value);

    window.setTimeout(() => {
      setMessage("");
    }, 2200);
  }

  function toggleFavorite(id: string) {
    const updated = favorites.includes(id)
      ? favorites.filter((item) => item !== id)
      : [...favorites, id];

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
  }

  function addToCart(game: BestSellerGame) {
    try {
      const saved = localStorage.getItem("zeta_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      const cart = Array.isArray(parsed) ? parsed : [];

      const exists = cart.some(
        (item: { id?: string }) => item.id === game.id
      );

      const updated = exists
        ? cart.map(
            (item: {
              id?: string;
              quantity?: number;
            }) =>
              item.id === game.id
                ? {
                    ...item,
                    quantity:
                      Number(item.quantity || 1) + 1,
                  }
                : item
          )
        : [
            ...cart,
            {
              id: game.id,
              name: game.name,
              platform: game.platform,
              price: game.price,
              oldPrice: game.oldPrice,
              image: game.image,
              quantity: 1,
            },
          ];

      localStorage.setItem(
        "zeta_cart",
        JSON.stringify(updated)
      );

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
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-36 top-16 h-[430px] w-[430px] rounded-full bg-orange-600/10 blur-[140px]" />
        <div className="absolute -left-36 top-[650px] h-[430px] w-[430px] rounded-full bg-violet-700/15 blur-[140px]" />
      </div>

      {message && (
        <div className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-2xl border border-violet-400/20 bg-[#171322]/95 px-5 py-3 text-xs font-black shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-950/40">
              Z
            </div>

            <div>
              <h1 className="text-xl font-black tracking-wider">
                ZETA
              </h1>
              <p className="text-[10px] text-gray-500">
                الألعاب الأكثر مبيعًا
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-black text-gray-200 transition hover:border-orange-400/30 hover:bg-orange-500/10 active:scale-95"
          >
            <span>الرئيسية</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-[34px] border border-orange-400/15 bg-[radial-gradient(circle_at_82%_18%,rgba(249,115,22,0.24),transparent_35%),linear-gradient(135deg,#1b1115,#100d18_70%)] px-5 py-12 shadow-2xl sm:px-9 sm:py-16">
          <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-black text-orange-300">
            الأكثر طلبًا 🔥
          </span>

          <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
            الألعاب التي يختارها
            <span className="mr-3 bg-gradient-to-l from-orange-300 to-fuchsia-300 bg-clip-text text-transparent">
              عملاء ZETA
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-8 text-gray-400">
            نفس الألعاب الظاهرة في فلتر الأكثر مبيعًا داخل صفحة
            اكتشف العروض، مرتبة حسب عدد المبيعات الفعلي.
          </p>

          {games.length > 0 && (
            <div className="mt-7 inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-[9px] text-gray-500">
                  إجمالي المبيعات الظاهرة
                </p>
                <p className="mt-1 text-sm font-black text-orange-300">
                  {totalSales}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black text-orange-400">
              ترتيب المنتجات
            </p>
            <h3 className="mt-1 text-3xl font-black sm:text-4xl">
              الأكثر مبيعًا
            </h3>
          </div>

          <button
            type="button"
            onClick={() => void loadBestSellers()}
            disabled={loading}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black text-gray-300 transition hover:border-orange-400/30 hover:bg-orange-500/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />
          </div>
        ) : games.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
            <div className="text-5xl">🔥</div>
            <h3 className="mt-5 text-lg font-black">
              لا توجد ألعاب مباعة حتى الآن
            </h3>
            <p className="mt-3 text-xs leading-6 text-gray-500">
              تظهر هنا الألعاب الحقيقية الموجودة في العروض عندما
              يصبح عدد مبيعاتها أكبر من صفر.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game, index) => (
              <article
                key={game.id}
                className="group overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0f0d16] shadow-xl transition hover:-translate-y-1 hover:border-orange-400/35"
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
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 via-fuchsia-700/10 to-orange-700/20 text-6xl">
                      🎮
                    </div>
                  )}

                  <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-xl bg-orange-500 px-2.5 py-1.5 text-[10px] font-black shadow-lg">
                    #{index + 1}
                  </span>

                  {game.discountPercent > 0 && (
                    <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-xl bg-red-500 px-2.5 py-1.5 text-[10px] font-black shadow-lg">
                      -{game.discountPercent}%
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleFavorite(game.id)}
                    className={`absolute left-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border text-lg backdrop-blur-md transition active:scale-90 ${
                      favorites.includes(game.id)
                        ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
                        : "border-white/10 bg-black/45 text-white"
                    }`}
                  >
                    {favorites.includes(game.id) ? "♥" : "♡"}
                  </button>
                </div>

                <div className="p-3.5">
                  <p className="truncate text-[9px] font-black text-fuchsia-400">
                    {game.label}
                  </p>

                  <Link
                    href={`/game/${game.id}`}
                    className="mt-1.5 block truncate text-sm font-black sm:text-base"
                  >
                    {game.name}
                  </Link>

                  <p className="mt-1 truncate text-[9px] text-gray-500">
                    {game.platform}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-lg font-black">
                        {game.price}
                        <span className="mr-1 text-[9px] font-bold text-gray-500">
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
                      className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xl font-black shadow-lg shadow-violet-950/40 transition hover:brightness-110 active:scale-90"
                      aria-label={`إضافة ${game.name} إلى السلة`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </main>
  );
}