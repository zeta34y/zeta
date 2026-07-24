"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type HeroSettings = {
  badge_text: string;
  title: string;
  description: string;
};

type OfferCategory = {
  id: string;
  name: string;
  slug: string;
  filter_key: string;
  sort_order: number;
  is_active: boolean;
};

type ProductData = {
  id: string;
  name: string;
  short_description: string | null;
  platform: string | null;
  price: number;
  old_price: number | null;
  cover_url: string | null;
  is_shared: boolean;
  is_best_seller_manual: boolean;
  sold_count: number;
};

type PackageData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  sold_count: number;
};

type OfferRow = {
  id: string;
  title: string;
  product_id: string | null;
  package_id: string | null;
  offer_category_id: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  products: ProductData | null;
  packages: PackageData | null;
};

type DisplayOffer = {
  id: string;
  sourceId: string;
  name: string;
  label: string;
  platform: string;
  price: number;
  oldPrice: number;
  image: string;
  bestSeller: boolean;
  soldCount: number;
  isPackage: boolean;
  isShared: boolean;
  offerCategoryId: string | null;
};

const fallbackHero: HeroSettings = {
  badge_text: "عروض محدودة 🔥",
  title: "وفر أكثر على ألعابك المفضلة",
  description:
    "مجموعة من أفضل الخصومات المتاحة حاليًا داخل متجر ZETA.",
};

const fallbackCategories: OfferCategory[] = [
  { id: "all", name: "الكل", slug: "all", filter_key: "all", sort_order: 0, is_active: true },
  { id: "shared", name: "مشترك", slug: "shared", filter_key: "shared", sort_order: 1, is_active: true },
  { id: "private", name: "خاص", slug: "private", filter_key: "private", sort_order: 2, is_active: true },
  { id: "best", name: "الأكثر مبيعًا", slug: "best-seller", filter_key: "best_seller", sort_order: 3, is_active: true },
  { id: "packages", name: "البكجات", slug: "packages", filter_key: "packages", sort_order: 4, is_active: true },
];

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function calculatePrice(
  originalPrice: number,
  type: "percentage" | "fixed",
  value: number
) {
  if (type === "percentage") {
    return Math.max(
      0,
      originalPrice - originalPrice * (value / 100)
    );
  }

  return Math.max(0, originalPrice - value);
}

export default function OffersPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [hero, setHero] = useState<HeroSettings>(fallbackHero);
  const [categories, setCategories] =
    useState<OfferCategory[]>(fallbackCategories);
  const [offers, setOffers] = useState<DisplayOffer[]>([]);
  const [filterId, setFilterId] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      setFavorites(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavorites([]);
    }

    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);

    try {
      const now = new Date().toISOString();

      const [heroResult, categoriesResult, offersResult] =
        await Promise.all([
          supabase
            .from("offers_hero_settings")
            .select("badge_text, title, description")
            .eq("id", 1)
            .maybeSingle(),

          supabase
            .from("offer_categories")
            .select(
              "id, name, slug, filter_key, sort_order, is_active"
            )
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),

          supabase
            .from("offers")
            .select(
              `
                id,
                title,
                product_id,
                package_id,
                offer_category_id,
                discount_type,
                discount_value,
                products (
                  id,
                  name,
                  short_description,
                  platform,
                  price,
                  old_price,
                  cover_url,
                  is_shared,
                  is_best_seller_manual,
                  sold_count
                ),
                packages (
                  id,
                  name,
                  description,
                  price,
                  old_price,
                  image_url,
                  sold_count
                )
              `
            )
            .eq("is_active", true)
            .lte("starts_at", now)
            .or(`ends_at.is.null,ends_at.gt.${now}`)
            .order("created_at", { ascending: false }),
        ]);

      if (heroResult.error) throw heroResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (offersResult.error) throw offersResult.error;

      if (heroResult.data) {
        setHero({
          badge_text:
            heroResult.data.badge_text ?? fallbackHero.badge_text,
          title:
            heroResult.data.title ?? fallbackHero.title,
          description:
            heroResult.data.description ??
            fallbackHero.description,
        });
      }

      const loadedCategories =
        (categoriesResult.data ?? []) as OfferCategory[];

      if (loadedCategories.length > 0) {
        setCategories(loadedCategories);
        setFilterId(loadedCategories[0].id);
      }

      const rows =
        (offersResult.data ?? []) as unknown as OfferRow[];

      const mapped = rows
        .map((offer): DisplayOffer | null => {
          const product = offer.products;
          const pkg = offer.packages;

          if (!product && !pkg) return null;

          const originalPrice = toNumber(
            product?.price ?? pkg?.price
          );
          const price = calculatePrice(
            originalPrice,
            offer.discount_type,
            toNumber(offer.discount_value)
          );

          return {
            id: offer.id,
            sourceId:
              product?.id ?? pkg?.id ?? offer.id,
            name:
              product?.name ?? pkg?.name ?? offer.title,
            label:
              product?.short_description ??
              (product?.is_shared
                ? "حساب PC مشترك"
                : pkg
                  ? "بكج ألعاب"
                  : "حساب PC خاص"),
            platform:
              product?.platform ??
              (pkg ? "بكج ألعاب PC" : "PC"),
            price: Math.round(price * 100) / 100,
            oldPrice: originalPrice,
            image:
              product?.cover_url ??
              pkg?.image_url ??
              "",
            bestSeller: false,
            soldCount: toNumber(
              product?.sold_count ?? pkg?.sold_count
            ),
            isPackage: Boolean(pkg),
            isShared: Boolean(product?.is_shared),
            offerCategoryId: offer.offer_category_id,
          };
        })
        .filter(
          (item): item is DisplayOffer =>
            item !== null
        );

      const bestSellerIds = new Set(
        [...mapped]
          .filter(
            (item) =>
              !item.isPackage && item.soldCount > 0
          )
          .sort(
            (first, second) =>
              second.soldCount - first.soldCount
          )
          .slice(0, 8)
          .map((item) => item.sourceId)
      );

      setOffers(
        mapped.map((item) => ({
          ...item,
          bestSeller: bestSellerIds.has(
            item.sourceId
          ),
        }))
      );
    } catch (error) {
      console.error("تعذر تحميل صفحة العروض:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeCategory = useMemo(
    () =>
      categories.find(
        (category) => category.id === filterId
      ) ?? categories[0],
    [categories, filterId]
  );

  const displayedGames = useMemo(() => {
    if (!activeCategory) return offers;

    switch (activeCategory.filter_key) {
      case "all":
        return offers;

      case "best_seller":
        return [...offers]
          .filter(
            (game) =>
              game.bestSeller &&
              !game.isPackage
          )
          .sort(
            (first, second) =>
              second.soldCount -
              first.soldCount
          );

      default:
        return offers.filter(
          (game) =>
            game.offerCategoryId ===
            activeCategory.id
        );
    }
  }, [activeCategory, offers]);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(
      () => setMessage(""),
      2200
    );
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
      new CustomEvent(
        "zeta-favorites-updated",
        { detail: updated }
      )
    );
  }

  function addToCart(game: DisplayOffer) {
    try {
      const saved =
        localStorage.getItem("zeta_cart");
      const parsed = saved
        ? JSON.parse(saved)
        : [];
      const cart = Array.isArray(parsed)
        ? parsed
        : [];

      const exists = cart.some(
        (item: { id: string }) =>
          item.id === game.sourceId
      );

      const updated = exists
        ? cart.map(
            (item: {
              id: string;
              quantity?: number;
            }) =>
              item.id === game.sourceId
                ? {
                    ...item,
                    quantity:
                      Number(
                        item.quantity || 1
                      ) + 1,
                  }
                : item
          )
        : [
            ...cart,
            {
              id: game.sourceId,
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
        new CustomEvent(
          "zeta-cart-updated",
          { detail: updated }
        )
      );
      showMessage(
        `تمت إضافة ${game.name} إلى السلة`
      );
    } catch {
      showMessage(
        "تعذر إضافة اللعبة إلى السلة"
      );
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-fuchsia-700/12 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-violet-700/12 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">
                ZETA
              </h1>
              <p className="text-[10px] text-gray-500">
                عروض الألعاب
              </p>
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
        <div className="relative overflow-hidden rounded-[32px] border border-fuchsia-400/15 bg-[radial-gradient(circle_at_75%_20%,rgba(192,38,211,0.28),transparent_36%),linear-gradient(135deg,#1d1024,#100d18_68%)] px-5 py-10 shadow-2xl sm:px-8 sm:py-14">
          <span className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-[11px] font-black text-fuchsia-300">
            {hero.badge_text}
          </span>

          <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight sm:text-5xl">
            {hero.title}
          </h2>

          <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
            {hero.description}
          </p>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setFilterId(item.id)
              }
              className={`shrink-0 rounded-full border px-5 py-3 text-xs font-black transition ${
                filterId === item.id
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-white/10 bg-white/[0.04] text-gray-400"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-12 text-center text-sm text-gray-500">
            جاري تحميل العروض...
          </div>
        ) : displayedGames.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
            <div className="text-4xl">🏷️</div>
            <h3 className="mt-4 text-lg font-black">
              لا توجد عروض في هذا التصنيف
            </h3>
            <p className="mt-2 text-xs text-gray-500">
              أضف عرضًا من لوحة الإدارة ليظهر هنا.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {displayedGames.map((game) => {
              const discount =
                game.oldPrice > 0
                  ? Math.round(
                      ((game.oldPrice -
                        game.price) /
                        game.oldPrice) *
                        100
                    )
                  : 0;

              const detailsLink =
                game.isPackage
                  ? `/packages/${game.sourceId}`
                  : `/game/${game.sourceId}`;

              return (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0f0d16] shadow-xl transition hover:-translate-y-1 hover:border-fuchsia-400/35"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link
                      href={detailsLink}
                      className="absolute inset-0 z-10"
                      aria-label={`عرض تفاصيل ${game.name}`}
                    />

                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center text-5xl transition group-hover:scale-105 ${
                          game.isPackage
                            ? "bg-gradient-to-br from-amber-700/20 via-violet-700/15 to-fuchsia-700/20"
                            : "bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20"
                        }`}
                      >
                        {game.isPackage
                          ? "🎁"
                          : "🎮"}
                      </div>
                    )}

                    {discount > 0 && (
                      <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black">
                        -{discount}%
                      </span>
                    )}

                    {game.bestSeller && (
                      <span className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-lg border border-orange-300/20 bg-orange-500/90 px-2 py-1 text-[9px] font-black text-white shadow-lg">
                        الأكثر مبيعًا 🔥
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        toggleFavorite(
                          game.sourceId
                        )
                      }
                      className={`absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md ${
                        favorites.includes(
                          game.sourceId
                        )
                          ? "border-rose-400/30 bg-rose-500/20 text-rose-300"
                          : "border-white/10 bg-black/40 text-white"
                      }`}
                    >
                      {favorites.includes(
                        game.sourceId
                      )
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-[9px] font-bold text-fuchsia-400">
                      {game.label}
                    </p>

                    <Link
                      href={detailsLink}
                      className="mt-1 block truncate text-sm font-black"
                    >
                      {game.name}
                    </Link>

                    <p className="mt-1 truncate text-[9px] text-gray-500">
                      {game.platform}
                    </p>

                    <div className="mt-3 flex items-end justify-between">
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
                        onClick={() =>
                          addToCart(game)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-lg font-black active:scale-90"
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