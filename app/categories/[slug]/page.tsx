"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type CategoryInfo = {
  id: string | null;
  name: string;
  icon: string;
  badge: string;
  description: string;
  gamesBadge: string;
  gamesTitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

type Game = {
  id: string;
  name: string;
  type: string;
  price: number;
  oldPrice: number;
  image: string;
  detailsHref: string;
  isPackage: boolean;
  badge?: string;
  discountPercent?: number;
};

type ProductRelation = {
  id: string;
  name: string;
  short_description: string | null;
  platform: string | null;
  price: number;
  old_price: number | null;
  cover_url: string | null;
  is_shared: boolean;
  card_badge: string | null;
  discount_percent: number | null;
};

type PackageRelation = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
};

type CategoryItemRow = {
  id: string;
  product_id: string | null;
  package_id: string | null;
  sort_order: number;
  products: ProductRelation | ProductRelation[] | null;
  packages: PackageRelation | PackageRelation[] | null;
};

const fallbackCategoryInfo: Record<string, CategoryInfo> = {
  simulation: {
    id: null,
    name: "ألعاب المحاكاة",
    icon: "🕹️",
    badge: "التصنيف المختار",
    description: "قيادة، حياة، بناء وإدارة",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب المحاكاة",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
  sports: {
    id: null,
    name: "ألعاب الرياضة",
    icon: "⚽",
    badge: "التصنيف المختار",
    description: "كرة قدم ورياضات متنوعة",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب الرياضة",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
  action: {
    id: null,
    name: "ألعاب الأكشن",
    icon: "🔥",
    badge: "التصنيف المختار",
    description: "قتال، إطلاق نار وحماس",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب الأكشن",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
  "2d": {
    id: null,
    name: "ألعاب 2D",
    icon: "👾",
    badge: "التصنيف المختار",
    description: "ألعاب ثنائية الأبعاد",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب 2D",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
  adventure: {
    id: null,
    name: "ألعاب المغامرات",
    icon: "🗺️",
    badge: "التصنيف المختار",
    description: "استكشاف وقصص وعوالم",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب المغامرات",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
  horror: {
    id: null,
    name: "ألعاب الرعب",
    icon: "👻",
    badge: "التصنيف المختار",
    description: "رعب وتشويق وبقاء",
    gamesBadge: "الألعاب",
    gamesTitle: "ألعاب الرعب",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  },
};

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function CategoryDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug || "");
  const fallbackCurrent = fallbackCategoryInfo[slug] ?? {
    id: null,
    name: "التصنيف",
    icon: "🎮",
    badge: "التصنيف المختار",
    description: "الألعاب الموجودة في هذا التصنيف",
    gamesBadge: "الألعاب",
    gamesTitle: "الألعاب المتوفرة",
    emptyTitle: "لا توجد ألعاب حاليًا",
    emptyDescription: "سيتم إضافة ألعاب جديدة قريبًا",
  };

  const [current, setCurrent] = useState<CategoryInfo>(fallbackCurrent);
  const [games, setGames] = useState<Game[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCategory() {
      setLoadingContent(true);

      try {
        const { data: category, error: categoryError } = await supabase
          .from("home_categories")
          .select(
            "id, name, icon, slug, page_badge, page_title, page_description, games_badge, games_title, empty_title, empty_description, use_custom_items, is_active"
          )
          .eq("slug", slug)
          .eq("is_active", true)
          .maybeSingle();

        if (!mounted) return;

        if (categoryError) throw categoryError;

        if (!category) {
          setCurrent({
            id: null,
            name: "التصنيف غير متوفر",
            icon: "🎮",
            badge: "صفحة التصنيف",
            description:
              "هذا التصنيف غير موجود أو تم إخفاؤه من المتجر.",
            gamesBadge: "الألعاب",
            gamesTitle: "لا توجد محتويات",
            emptyTitle: "التصنيف غير متوفر",
            emptyDescription:
              "ارجع إلى الصفحة الرئيسية واختر تصنيفًا ظاهرًا.",
          });
          setGames([]);
          return;
        }

        const loadedInfo: CategoryInfo = {
          id: category.id,
          name: category.page_title || category.name,
          icon: category.icon || "🎮",
          badge: category.page_badge || "التصنيف المختار",
          description:
            category.page_description ||
            "الألعاب الموجودة في هذا التصنيف",
          gamesBadge: category.games_badge || "الألعاب",
          gamesTitle:
            category.games_title ||
            category.page_title ||
            category.name,
          emptyTitle:
            category.empty_title || "لا توجد ألعاب حاليًا",
          emptyDescription:
            category.empty_description ||
            "سيتم إضافة ألعاب جديدة قريبًا",
        };

        setCurrent(loadedInfo);

        const { data: itemRows, error: itemsError } = await supabase
          .from("home_category_items")
          .select(
            `
              id,
              product_id,
              package_id,
              sort_order,
              products (
                id,
                name,
                short_description,
                platform,
                price,
                old_price,
                cover_url,
                is_shared,
                card_badge,
                discount_percent
              ),
              packages (
                id,
                name,
                description,
                price,
                old_price,
                image_url
              )
            `
          )
          .eq("category_id", category.id)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (!mounted) return;
        if (itemsError) throw itemsError;

        const rows = (itemRows ?? []) as unknown as CategoryItemRow[];

        const mapped = rows
          .map((row): Game | null => {
            const product = relationOne(row.products);
            const pkg = relationOne(row.packages);

            if (product) {
              return {
                id: `product-${product.id}`,
                name: product.name,
                type:
                  product.short_description ||
                  product.platform ||
                  (product.is_shared
                    ? "حساب PC مشترك"
                    : "حساب PC خاص"),
                price: toNumber(product.price),
                oldPrice: toNumber(
                  product.old_price ?? product.price
                ),
                image: product.cover_url ?? "",
                detailsHref: `/game/${product.id}`,
                isPackage: false,
                badge: product.card_badge || "",
                discountPercent:
                  product.discount_percent === null ||
                  product.discount_percent === undefined
                    ? undefined
                    : toNumber(product.discount_percent),
              };
            }

            if (pkg) {
              return {
                id: `package-${pkg.id}`,
                name: pkg.name,
                type: pkg.description || "بكج ألعاب",
                price: toNumber(pkg.price),
                oldPrice: toNumber(pkg.old_price ?? pkg.price),
                image: pkg.image_url ?? "",
                detailsHref: `/packages/${pkg.id}`,
                isPackage: true,
              };
            }

            return null;
          })
          .filter((item): item is Game => item !== null);

        setGames(mapped);
      } catch (error) {
        console.error("تعذر تحميل صفحة التصنيف:", error);
      } finally {
        if (mounted) setLoadingContent(false);
      }
    }

    loadCategory();

    function refreshCategory() {
      loadCategory();
    }

    window.addEventListener("focus", refreshCategory);

    const channel = supabase
      .channel(`zeta-category-${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "home_categories",
        },
        refreshCategory
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "home_category_items",
        },
        refreshCategory
      )
      .subscribe();

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshCategory);
      supabase.removeChannel(channel);
    };
  }, [slug]);

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
              image: game.image,
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
                {current.badge}
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
              {current.gamesBadge}
            </p>
            <h2 className="mt-1 text-lg font-black sm:text-xl">
              {current.gamesTitle}
            </h2>
          </div>

          <span className="rounded-full bg-white/5 px-3 py-1.5 text-[9px] text-gray-400 sm:text-[10px]">
            {loadingContent ? "…" : games.length} ألعاب
          </span>
        </div>

        {games.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              // نسبة البطاقة للعرض فقط ولا تغيّر السعر.
              const discount = game.discountPercent ?? 0;

              return (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30 sm:rounded-[22px]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link
                      href={game.detailsHref}
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
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-4xl transition duration-300 group-hover:scale-105 sm:text-5xl">
                        {game.isPackage ? "🎁" : "🎮"}
                      </div>
                    )}

                    <div className="pointer-events-none absolute right-2 top-2 z-20 flex max-w-[72%] items-center gap-1.5">
                      {discount > 0 && (
                        <span className="shrink-0 rounded-lg bg-red-500 px-2 py-1 text-[8px] font-black sm:text-[9px]">
                          -{discount}%
                        </span>
                      )}

                      <span className="truncate rounded-lg border border-violet-300/20 bg-violet-500/20 px-2 py-1 text-[8px] font-black text-violet-100 backdrop-blur-md">
                        {game.badge || "بدون دينفو"}
                      </span>
                    </div>

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
                      href={game.detailsHref}
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

                        {game.oldPrice > game.price && (
                          <p className="text-[8px] text-gray-600 line-through sm:text-[9px]">
                            {game.oldPrice} ر.س
                          </p>
                        )}
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
              {loadingContent ? "جاري تحميل الألعاب..." : current.emptyTitle}
            </h3>

            <p className="mt-2 text-xs text-gray-500">
              {loadingContent
                ? "لحظات وتظهر محتويات التصنيف"
                : current.emptyDescription}
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