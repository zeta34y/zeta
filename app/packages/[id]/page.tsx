"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number | string;
  old_price: number | string | null;
  stock: number | string;
  is_active: boolean;
};

type IncludedProduct = {
  id: string;
  name: string;
  platform: string | null;
  cover_url: string | null;
};

type PackageItemRow = {
  product_id: string;
  quantity: number | string;
  products: IncludedProduct | IncludedProduct[] | null;
};

type LoadedPackage = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  oldPrice: number;
  stock: number;
};

type LoadedPackageItem = {
  id: string;
  name: string;
  platform: string;
  image: string;
  quantity: number;
};

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function relationOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default function PackageDetailsPage() {
  const params = useParams<{ id: string }>();
  const packageId = params.id;

  const [pkg, setPkg] = useState<LoadedPackage | null>(null);
  const [includedGames, setIncludedGames] = useState<LoadedPackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      const favorites = Array.isArray(parsed) ? parsed : [];
      setFavorite(favorites.includes(`package-${packageId}`));
    } catch {
      setFavorite(false);
    }
  }, [packageId]);

  useEffect(() => {
    let mounted = true;

    async function loadPackage() {
      setLoading(true);

      try {
        const [packageResult, itemsResult] = await Promise.all([
          supabase
            .from("packages")
            .select(
              "id, name, description, image_url, price, old_price, stock, is_active"
            )
            .eq("id", packageId)
            .eq("is_active", true)
            .maybeSingle(),
          supabase
            .from("package_items")
            .select(
              `
                product_id,
                quantity,
                products (
                  id,
                  name,
                  platform,
                  cover_url
                )
              `
            )
            .eq("package_id", packageId),
        ]);

        if (packageResult.error) throw packageResult.error;
        if (itemsResult.error) throw itemsResult.error;
        if (!mounted) return;

        const packageData = packageResult.data as PackageRow | null;

        if (!packageData) {
          setPkg(null);
          setIncludedGames([]);
          return;
        }

        const price = toNumber(packageData.price);
        const oldPrice = packageData.old_price
          ? toNumber(packageData.old_price)
          : price;

        setPkg({
          id: packageData.id,
          name: packageData.name,
          description:
            packageData.description ||
            "مجموعة ألعاب داخل بكج واحد بسعر مميز.",
          image: packageData.image_url || "",
          price,
          oldPrice: oldPrice > 0 ? oldPrice : price,
          stock: Math.max(0, Math.floor(toNumber(packageData.stock))),
        });

        const rows =
          (itemsResult.data ?? []) as unknown as PackageItemRow[];

        const mappedItems = rows
          .map((row): LoadedPackageItem | null => {
            const product = relationOne(row.products);

            if (!product) return null;

            return {
              id: product.id,
              name: product.name,
              platform: product.platform || "PC",
              image: product.cover_url || "",
              quantity: Math.max(1, Math.floor(toNumber(row.quantity) || 1)),
            };
          })
          .filter((item): item is LoadedPackageItem => item !== null);

        setIncludedGames(mappedItems);
      } catch (error) {
        console.error("تعذر تحميل البكج:", error);

        if (mounted) {
          setPkg(null);
          setIncludedGames([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadPackage();

    const channel = supabase
      .channel(`zeta-package-${packageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "packages",
          filter: `id=eq.${packageId}`,
        },
        loadPackage
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "package_items",
          filter: `package_id=eq.${packageId}`,
        },
        loadPackage
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [packageId]);

  const discountPercent = useMemo(() => {
    if (!pkg || pkg.oldPrice <= pkg.price || pkg.oldPrice <= 0) return 0;

    return Math.round(
      ((pkg.oldPrice - pkg.price) / pkg.oldPrice) * 100
    );
  }, [pkg]);

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2200);
  }

  function toggleFavorite() {
    if (!pkg) return;

    const favoriteId = `package-${pkg.id}`;

    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      const current = Array.isArray(parsed) ? parsed : [];
      const exists = current.includes(favoriteId);
      const updated = exists
        ? current.filter((id: string) => id !== favoriteId)
        : [...current, favoriteId];

      localStorage.setItem("zeta_favorites", JSON.stringify(updated));
      setFavorite(!exists);

      window.dispatchEvent(
        new CustomEvent("zeta-favorites-updated", {
          detail: updated,
        })
      );

      showMessage(
        exists
          ? `تمت إزالة ${pkg.name} من المفضلة`
          : `تمت إضافة ${pkg.name} إلى المفضلة`
      );
    } catch {
      showMessage("تعذر تحديث المفضلة");
    }
  }

  function addToCart() {
    if (!pkg || adding) return;

    setAdding(true);

    try {
      const cartId = `package-${pkg.id}`;
      const saved = localStorage.getItem("zeta_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      const cart = Array.isArray(parsed) ? parsed : [];
      const existingIndex = cart.findIndex(
        (item: { id: string }) => item.id === cartId
      );

      const updated =
        existingIndex >= 0
          ? cart.map((item: { id: string; quantity?: number }) =>
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
                name: pkg.name,
                platform: "بكج ألعاب PC",
                price: pkg.price,
                oldPrice: pkg.oldPrice,
                image: pkg.image,
                quantity: 1,
                itemType: "package",
              },
            ];

      localStorage.setItem("zeta_cart", JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updated,
        })
      );

      showMessage(`تمت إضافة ${pkg.name} إلى السلة`);
    } catch {
      showMessage("تعذر إضافة البكج إلى السلة");
    } finally {
      window.setTimeout(() => setAdding(false), 550);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-xs text-gray-500">جاري تحميل البكج...</p>
        </div>
      </main>
    );
  }

  if (!pkg) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white"
      >
        <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#12101a] p-7 text-center shadow-2xl">
          <div className="text-5xl">🎁</div>
          <h1 className="mt-5 text-2xl font-black">البكج غير موجود</h1>
          <p className="mt-3 text-sm leading-7 text-gray-500">
            قد يكون البكج غير مفعّل أو تم حذفه من المتجر.
          </p>
          <Link
            href="/packages"
            className="mt-6 inline-flex rounded-2xl bg-violet-600 px-6 py-3 text-sm font-black"
          >
            الرجوع إلى البكجات
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-40 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-orange-600/10 blur-[145px]" />
        <div className="absolute -left-40 top-[560px] h-[420px] w-[420px] rounded-full bg-violet-700/12 blur-[145px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-violet-700 text-xl font-black">
              Z
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">تفاصيل البكج</p>
            </div>
          </div>

          <Link
            href="/packages"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 active:scale-95"
          >
            <span>البكجات</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 pt-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-[30px] border border-orange-400/20 bg-gradient-to-br from-[#211420] to-[#100d18] shadow-2xl">
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/12] lg:aspect-auto lg:min-h-[560px]">
            {pkg.image ? (
              <img
                src={pkg.image}
                alt={pkg.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[420px] items-center justify-center bg-gradient-to-br from-orange-600/15 to-violet-700/20 text-8xl">
                🎁
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#100d18] via-transparent to-black/15" />

            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black">
                بكج
              </span>

              {discountPercent > 0 && (
                <span className="rounded-xl bg-red-500 px-3 py-2 text-[11px] font-black">
                  -{discountPercent}%
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              className={`absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border text-xl backdrop-blur-md transition active:scale-90 ${
                favorite
                  ? "border-rose-400/40 bg-rose-500/25 text-rose-300"
                  : "border-white/10 bg-black/40 text-white"
              }`}
            >
              {favorite ? "♥" : "♡"}
            </button>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/[0.08] bg-[#12101a] p-5 shadow-2xl sm:p-7">
          <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] font-black text-orange-300">
            وفر أكثر 🎁
          </span>

          <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
            {pkg.name}
          </h2>

          <p className="mt-4 text-sm leading-8 text-gray-400">
            {pkg.description}
          </p>

          <div className="mt-6 flex items-end justify-between rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
            <div>
              <p className="text-xs text-gray-500">سعر البكج</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-black">{pkg.price}</span>
                <span className="pb-1 text-xs text-gray-500">ر.س</span>
              </div>

              {pkg.oldPrice > pkg.price && (
                <p className="mt-1 text-xs text-gray-600 line-through">
                  {pkg.oldPrice} ر.س
                </p>
              )}
            </div>

            <div className="text-left">
              <p className="text-xs text-gray-500">المتوفر</p>
              <p className="mt-1 text-lg font-black text-emerald-300">
                {pkg.stock > 0 ? pkg.stock : "متاح"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={adding}
            className="mt-5 flex w-full items-center justify-center gap-3 rounded-[22px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-6 py-4 text-sm font-black shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:opacity-60"
          >
            <span>{adding ? "✓" : "+"}</span>
            <span>{adding ? "تمت الإضافة" : "إضافة البكج إلى السلة"}</span>
          </button>

          <div className="mt-7 border-t border-white/10 pt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-orange-300">محتويات البكج</p>
                <h3 className="mt-1 text-xl font-black">الألعاب المشمولة</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-gray-400">
                {includedGames.length} لعبة
              </span>
            </div>

            {includedGames.length === 0 ? (
              <div className="mt-4 rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center">
                <div className="text-3xl">🎮</div>
                <p className="mt-3 text-sm font-black">لا توجد ألعاب مضافة للبكج</p>
                <p className="mt-2 text-xs text-gray-600">
                  أضف الألعاب إلى البكج من لوحة الإدارة.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {includedGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="flex items-center gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.035] p-3 transition hover:border-violet-400/30 hover:bg-violet-500/10"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-violet-500/10">
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🎮
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{game.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-500">
                        <span>{game.platform}</span>
                        {game.quantity > 1 && (
                          <>
                            <span>•</span>
                            <span>الكمية {game.quantity}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-violet-400">←</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[360px] rounded-[22px] border border-violet-300/20 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}

      <BottomNav />
    </main>
  );
}