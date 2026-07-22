"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";

type FavoriteGame = {
  id: string;
  name: string;
  kind: "featured" | "shared" | "private";
  label: string;
  platform: string;
  category: string;
  price: number;
  oldPrice: number;
};

const games: Record<string, FavoriteGame> = {
  "featured-1": { id: "featured-1", name: "EA SPORTS FC 26", kind: "featured", label: "لعبة مميزة", platform: "PC", category: "رياضة", price: 189, oldPrice: 249 },
  "featured-2": { id: "featured-2", name: "Call of Duty", kind: "featured", label: "لعبة مميزة", platform: "PC", category: "أكشن", price: 159, oldPrice: 219 },
  "featured-3": { id: "featured-3", name: "Grand Theft Auto V", kind: "featured", label: "لعبة مميزة", platform: "Rockstar PC", category: "عالم مفتوح", price: 79, oldPrice: 129 },
  "featured-4": { id: "featured-4", name: "Forza Horizon", kind: "featured", label: "لعبة مميزة", platform: "Xbox PC", category: "سباقات", price: 139, oldPrice: 199 },
  "shared-1": { id: "shared-1", name: "EA SPORTS FC", kind: "shared", label: "حساب مشترك", platform: "Steam PC", category: "رياضة", price: 29, oldPrice: 49 },
  "shared-2": { id: "shared-2", name: "GTA V", kind: "shared", label: "حساب مشترك", platform: "Rockstar PC", category: "عالم مفتوح", price: 19, oldPrice: 39 },
  "shared-3": { id: "shared-3", name: "Forza Horizon", kind: "shared", label: "حساب مشترك", platform: "Xbox PC", category: "سباقات", price: 35, oldPrice: 59 },
  "private-1": { id: "private-1", name: "Call of Duty", kind: "private", label: "حساب خاص", platform: "حساب خاص", category: "أكشن", price: 149, oldPrice: 199 },
  "private-2": { id: "private-2", name: "Red Dead Redemption", kind: "private", label: "حساب خاص", platform: "حساب خاص", category: "مغامرات", price: 119, oldPrice: 169 },
  "private-3": { id: "private-3", name: "Cyber Adventure", kind: "private", label: "حساب خاص", platform: "حساب خاص", category: "مغامرات", price: 89, oldPrice: 129 },
};

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zeta_favorites");
      const parsed = saved ? JSON.parse(saved) : [];
      setFavoriteIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavoriteIds([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const favoriteGames = useMemo(
    () => favoriteIds.map((id) => games[id]).filter(Boolean),
    [favoriteIds]
  );

  function saveFavorites(ids: string[]) {
    setFavoriteIds(ids);
    localStorage.setItem("zeta_favorites", JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("zeta-favorites-updated", { detail: ids }));
  }

  function removeFavorite(id: string) {
    setRemovingId(id);
    window.setTimeout(() => {
      saveFavorites(favoriteIds.filter((item) => item !== id));
      setRemovingId(null);
      setMessage("تمت إزالة اللعبة من المفضلة");
      window.setTimeout(() => setMessage(""), 2200);
    }, 260);
  }

  function clearFavorites() {
    if (!window.confirm("هل أنت متأكد من حذف جميع الألعاب من المفضلة؟")) return;
    saveFavorites([]);
    setMessage("تم حذف جميع الألعاب من المفضلة");
    window.setTimeout(() => setMessage(""), 2200);
  }

  function addToCart(game: FavoriteGame) {
    try {
      const saved = localStorage.getItem("zeta_cart");
      const cart = saved ? JSON.parse(saved) : [];
      const safeCart = Array.isArray(cart) ? cart : [];
      const exists = safeCart.some((item: { id: string }) => item.id === game.id);
      const updated = exists
        ? safeCart.map((item: { id: string; quantity?: number }) =>
            item.id === game.id ? { ...item, quantity: Number(item.quantity || 1) + 1 } : item
          )
        : [...safeCart, { id: game.id, name: game.name, price: game.price, oldPrice: game.oldPrice, platform: game.platform, image: "", quantity: 1 }];

      localStorage.setItem("zeta_cart", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("zeta-cart-updated", { detail: updated }));
      setMessage(`تمت إضافة ${game.name} إلى السلة`);
      window.setTimeout(() => setMessage(""), 2200);
    } catch {
      setMessage("تعذر إضافة اللعبة إلى السلة");
      window.setTimeout(() => setMessage(""), 2200);
    }
  }

  if (!loaded) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#08070d] text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
      </main>
    );
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -left-28 bottom-10 h-96 w-96 rounded-full bg-rose-700/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black">Z</div>
            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">قائمة المفضلة</p>
            </div>
          </div>
          <Link href="/" className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 active:scale-95">
            <span>الرئيسية</span><span>←</span>
          </Link>
        </div>
      </header>

      {favoriteGames.length === 0 ? (
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-180px)] max-w-5xl items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl rounded-[34px] border border-rose-400/15 bg-gradient-to-br from-[#1a1320] via-[#100d18] to-[#0c0a11] px-5 py-11 text-center shadow-2xl">
            <div className="mx-auto flex h-28 w-28 animate-[heartFloat_2400ms_ease-in-out_infinite] items-center justify-center rounded-[34px] border border-white/10 bg-gradient-to-br from-rose-600/25 to-violet-600/15 text-6xl">♡</div>
            <h2 className="mt-6 text-2xl font-black sm:text-3xl">لا توجد ألعاب مفضلة</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-400">أضف الألعاب التي تعجبك إلى المفضلة لتجدها هنا بسهولة.</p>
            <Link href="/#new-games" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose-600 to-violet-600 px-7 py-4 text-sm font-black sm:w-auto">استكشف الألعاب 🎮</Link>
          </div>
        </section>
      ) : (
        <section className="relative z-10 mx-auto max-w-6xl px-4 py-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-rose-400">ألعاب أعجبتك</p>
              <h2 className="mt-1 text-2xl font-black">المفضلة</h2>
              <p className="mt-2 text-xs text-gray-500">لديك {favoriteGames.length} لعبة في المفضلة</p>
            </div>
            <button type="button" onClick={clearFavorites} className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 active:scale-95">حذف الكل</button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {favoriteGames.map((game) => {
              const discount = Math.round(((game.oldPrice - game.price) / game.oldPrice) * 100);
              const accent = game.kind === "private" ? "from-fuchsia-600 to-violet-600" : "from-violet-600 to-indigo-600";
              return (
                <article key={game.id} className={`group overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111019] shadow-xl transition-all duration-300 ${removingId === game.id ? "-translate-x-8 scale-95 opacity-0" : "opacity-100"}`}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link href={`/game/${game.id}`} className="absolute inset-0 z-10" aria-label={`عرض ${game.name}`} />
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl transition group-hover:scale-105">🎮</div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111019] via-transparent to-transparent" />
                    <span className="absolute right-2 top-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black">-{discount}%</span>
                    <button type="button" onClick={() => removeFavorite(game.id)} className="absolute left-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/15 text-lg text-rose-300 active:scale-90">♥</button>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold text-violet-400">{game.label}</p>
                    <Link href={`/game/${game.id}`} className="mt-1 block line-clamp-1 text-sm font-black">{game.name}</Link>
                    <p className="mt-1 line-clamp-1 text-[10px] text-gray-500">{game.platform}</p>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-base font-black">{game.price}<span className="mr-1 text-[9px] text-gray-500">ر.س</span></p>
                        <p className="text-[9px] text-gray-600 line-through">{game.oldPrice} ر.س</p>
                      </div>
                      <button type="button" onClick={() => addToCart(game)} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-lg font-black active:scale-90`}>+</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-violet-300/20 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black shadow-2xl backdrop-blur-xl">{message}</div>
        </div>
      )}

      <BottomNav />

      <style jsx global>{`
        @keyframes heartFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-9px) scale(1.04); }
        }
      `}</style>
    </main>
  );
}