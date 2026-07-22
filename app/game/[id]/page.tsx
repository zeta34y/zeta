"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

type GameDetails = {
  id: string;
  name: string;
  kind: "featured" | "shared" | "private";
  label: string;
  platform: string;
  category: string;
  price: number | null;
  oldPrice: number | null;
  description: string;
};

const games: Record<string, GameDetails> = {
  "featured-1": {
    id: "featured-1",
    name: "EA SPORTS FC 26",
    kind: "featured",
    label: "لعبة مميزة",
    platform: "PC",
    category: "رياضة",
    price: 189,
    oldPrice: 249,
    description:
      "استمتع بتجربة كرة قدم مليئة بالحماس مع أطوار لعب متنوعة وتجربة مناسبة للاعبين على الكمبيوتر.",
  },
  "featured-2": {
    id: "featured-2",
    name: "Call of Duty",
    kind: "featured",
    label: "لعبة مميزة",
    platform: "PC",
    category: "أكشن",
    price: 159,
    oldPrice: 219,
    description:
      "تجربة أكشن سريعة ومواجهات قوية مع محتوى متنوع يناسب محبي ألعاب القتال وإطلاق النار.",
  },
  "featured-3": {
    id: "featured-3",
    name: "Grand Theft Auto V",
    kind: "featured",
    label: "لعبة مميزة",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 79,
    oldPrice: 129,
    description:
      "عالم مفتوح واسع مليء بالمهمات والاستكشاف والأنشطة المتنوعة مع تجربة قصصية ممتعة.",
  },
  "featured-4": {
    id: "featured-4",
    name: "Forza Horizon",
    kind: "featured",
    label: "لعبة مميزة",
    platform: "Xbox PC",
    category: "سباقات",
    price: 139,
    oldPrice: 199,
    description:
      "قد سياراتك المفضلة في عالم مفتوح جميل مع سباقات وفعاليات كثيرة وتجربة قيادة ممتعة.",
  },
  "shared-1": {
    id: "shared-1",
    name: "EA SPORTS FC",
    kind: "shared",
    label: "حساب مشترك",
    platform: "Steam PC",
    category: "رياضة",
    price: 29,
    oldPrice: 49,
    description:
      "نسخة اقتصادية بحساب مشترك. تحصل على بيانات الاستخدام والتعليمات اللازمة بعد إتمام الطلب.",
  },
  "shared-2": {
    id: "shared-2",
    name: "GTA V",
    kind: "shared",
    label: "حساب مشترك",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 19,
    oldPrice: 39,
    description:
      "استمتع بعالم GTA V بسعر اقتصادي من خلال حساب مشترك مع خطوات استخدام واضحة.",
  },
  "shared-3": {
    id: "shared-3",
    name: "Forza Horizon",
    kind: "shared",
    label: "حساب مشترك",
    platform: "Xbox PC",
    category: "سباقات",
    price: 35,
    oldPrice: 59,
    description:
      "خيار اقتصادي لمحبي السباقات على الكمبيوتر، مع بيانات حساب مشترك وتعليمات الاستخدام.",
  },
  "private-1": {
    id: "private-1",
    name: "Call of Duty",
    kind: "private",
    label: "حساب خاص",
    platform: "حساب خاص",
    category: "أكشن",
    price: 149,
    oldPrice: 199,
    description:
      "حساب خاص بك مع بيانات دخول مستقلة لتجربة أكثر خصوصية وراحة أثناء اللعب.",
  },
  "private-2": {
    id: "private-2",
    name: "Red Dead Redemption",
    kind: "private",
    label: "حساب خاص",
    platform: "حساب خاص",
    category: "مغامرات",
    price: 119,
    oldPrice: 169,
    description:
      "تجربة قصصية في عالم مفتوح بحساب خاص وبيانات دخول مستقلة يتم تسليمها بعد الطلب.",
  },
  "private-3": {
    id: "private-3",
    name: "Cyber Adventure",
    kind: "private",
    label: "حساب خاص",
    platform: "حساب خاص",
    category: "مغامرات",
    price: 89,
    oldPrice: 129,
    description:
      "مغامرة رقمية بحساب خاص مناسبة لمحبي الاستكشاف والقصص، مع بيانات مستقلة.",
  },
};

export default function GameDetailsPage() {
  const params = useParams<{ id: string }>();
  const game = games[params.id];
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  function addToCart() {
    if (!game || game.price === null) return;

    try {
      const savedCart = localStorage.getItem("zeta_cart");
      const currentCart = savedCart ? JSON.parse(savedCart) : [];
      const safeCart = Array.isArray(currentCart) ? currentCart : [];

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
              oldPrice: game.oldPrice ?? game.price,
              platform: game.platform,
              image: "",
              quantity: 1,
            },
          ];

      localStorage.setItem("zeta_cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("zeta-cart-updated"));

      setAdding(true);
      setMessage("تمت إضافة اللعبة إلى السلة ✓");

      window.setTimeout(() => setAdding(false), 550);
      window.setTimeout(() => setMessage(""), 2200);
    } catch (error) {
      console.error("تعذر إضافة اللعبة للسلة:", error);
      setMessage("تعذر إضافة اللعبة، حاول مرة أخرى");
      window.setTimeout(() => setMessage(""), 2200);
    }
  }

  if (!game) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 pb-32 text-white"
      >
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-violet-500/10 text-5xl">
            🎮
          </div>

          <h1 className="mt-5 text-2xl font-black">اللعبة غير موجودة</h1>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-violet-600 px-6 py-3 text-sm font-black"
          >
            العودة للمتجر
          </Link>
        </div>

        <BottomNav />
      </main>
    );
  }

  const discount =
    game.price !== null &&
    game.oldPrice !== null &&
    game.oldPrice > game.price
      ? Math.round(((game.oldPrice - game.price) / game.oldPrice) * 100)
      : 0;

  const accent =
    game.kind === "private"
      ? "from-fuchsia-600 to-violet-600"
      : "from-violet-600 to-indigo-600";

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-28 top-10 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -left-28 bottom-10 h-96 w-96 rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black">
              Z
            </div>

            <div>
              <h1 className="text-base font-black tracking-wider">ZETA</h1>
              <p className="text-[9px] text-gray-500">تفاصيل اللعبة</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition active:scale-95"
          >
            <span>العودة</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-5 md:grid-cols-[minmax(0,420px)_1fr] md:items-start">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-violet-700/25 to-fuchsia-700/15 shadow-2xl shadow-violet-950/30">
            <div className="flex h-full w-full items-center justify-center text-8xl">
              🎮
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b14] via-transparent to-transparent" />

            <span className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-black backdrop-blur-md">
              {game.label}
            </span>

            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-xl bg-red-500 px-3 py-2 text-[10px] font-black">
                -{discount}%
              </span>
            )}
          </div>

          <div className="rounded-[30px] border border-white/[0.08] bg-[#111019] p-5 sm:p-7">
            <p className="text-xs font-black text-violet-400">
              {game.category} • {game.platform}
            </p>

            <h2 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
              {game.name}
            </h2>

            <p className="mt-5 text-sm leading-8 text-gray-400">
              {game.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <p className="text-[10px] text-gray-500">نوع المنتج</p>
                <p className="mt-2 text-sm font-black">{game.label}</p>
              </div>

              <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4">
                <p className="text-[10px] text-gray-500">المنصة</p>
                <p className="mt-2 text-sm font-black">{game.platform}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[26px] border border-violet-400/15 bg-gradient-to-br from-violet-600/10 to-transparent p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] text-gray-500">السعر الحالي</p>

                  {game.price !== null ? (
                    <p className="mt-1 text-3xl font-black">
                      {game.price}
                      <span className="mr-1 text-xs text-gray-400">ر.س</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xl font-black text-violet-300">
                      السعر قريبًا
                    </p>
                  )}

                  {game.oldPrice !== null &&
                    game.price !== null &&
                    game.oldPrice > game.price && (
                      <p className="mt-1 text-xs text-gray-600 line-through">
                        {game.oldPrice} ر.س
                      </p>
                    )}
                </div>

                {discount > 0 && (
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
                    وفر {game.oldPrice! - game.price!} ر.س
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={game.price === null}
                onClick={addToCart}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l ${accent} px-5 py-4 text-sm font-black shadow-xl shadow-violet-950/30 transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  adding ? "scale-[0.97] brightness-125" : "scale-100"
                }`}
              >
                <span>{adding ? "تمت الإضافة ✓" : "أضف للسلة"}</span>
                <span>🛒</span>
              </button>

              <Link
                href="/cart"
                className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-xs font-black text-gray-300 transition hover:bg-white/10 active:scale-[0.98]"
              >
                الذهاب إلى السلة
              </Link>
            </div>
          </div>
        </div>
      </section>

      {message && (
        <div className="fixed bottom-28 left-1/2 z-[180] w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-2xl border border-violet-300/20 bg-[#171322]/95 px-4 py-3 text-center text-xs font-black shadow-2xl backdrop-blur-xl">
          {message}
        </div>
      )}

      <BottomNav />
    </main>
  );
}