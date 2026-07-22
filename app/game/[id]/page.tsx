"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";

type GameDetails = {
  id: string;
  name: string;
  kind: "featured" | "shared" | "private";
  label: string;
  platform: string;
  category: string;
  price: number;
  oldPrice: number;
  description: string;
  delivery: string;
  ownership: string;
  usage: string;
  gallery: {
    image: string;
    title: string;
  }[];
};

const games: Record<string, GameDetails> = {
  "featured-1": {
    id: "featured-1",
    name: "EA SPORTS FC 26",
    kind: "featured",
    label: "نسخة رقمية",
    platform: "PC",
    category: "رياضة",
    price: 189,
    oldPrice: 249,
    description:
      "تجربة كرة قدم حديثة بمباريات وأطوار متنوعة. المنتج رقمي ويتم إرسال تفاصيل الاستلام بعد إتمام الطلب.",
    delivery: "تسليم رقمي بعد تأكيد الطلب",
    ownership: "نسخة رقمية للكمبيوتر",
    usage: "تصل تعليمات الاستخدام مع الطلب",
    gallery: [
      { image: "", title: "واجهة اللعبة" },
      { image: "", title: "أجواء المباريات" },
      { image: "", title: "تفاصيل المنتج" },
    ],
  },
  "featured-2": {
    id: "featured-2",
    name: "Call of Duty",
    kind: "featured",
    label: "نسخة رقمية",
    platform: "PC",
    category: "أكشن",
    price: 159,
    oldPrice: 219,
    description:
      "لعبة أكشن ومواجهات سريعة بمحتوى متنوع. تحصل على المنتج رقميًا مع تفاصيل الاستلام والاستخدام.",
    delivery: "تسليم رقمي بعد تأكيد الطلب",
    ownership: "نسخة رقمية للكمبيوتر",
    usage: "تصل تعليمات الاستخدام مع الطلب",
    gallery: [
      { image: "", title: "صورة الغلاف" },
      { image: "", title: "لقطة من اللعبة" },
      { image: "", title: "محتوى اللعبة" },
    ],
  },
  "featured-3": {
    id: "featured-3",
    name: "Grand Theft Auto V",
    kind: "featured",
    label: "نسخة رقمية",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 79,
    oldPrice: 129,
    description:
      "عالم مفتوح كبير مليء بالمهمات والاستكشاف. المنتج مخصص للكمبيوتر ويتم تسليمه رقميًا.",
    delivery: "تسليم رقمي بعد تأكيد الطلب",
    ownership: "نسخة رقمية عبر Rockstar",
    usage: "تصل تعليمات الاستخدام مع الطلب",
    gallery: [
      { image: "", title: "مدينة اللعبة" },
      { image: "", title: "العالم المفتوح" },
      { image: "", title: "تفاصيل النسخة" },
    ],
  },
  "featured-4": {
    id: "featured-4",
    name: "Forza Horizon",
    kind: "featured",
    label: "نسخة رقمية",
    platform: "Xbox PC",
    category: "سباقات",
    price: 139,
    oldPrice: 199,
    description:
      "لعبة سباقات بعالم مفتوح وسيارات متعددة. المنتج رقمي ومخصص للاستخدام على الكمبيوتر.",
    delivery: "تسليم رقمي بعد تأكيد الطلب",
    ownership: "نسخة رقمية عبر Xbox PC",
    usage: "تصل تعليمات الاستخدام مع الطلب",
    gallery: [
      { image: "", title: "عالم السباقات" },
      { image: "", title: "السيارات" },
      { image: "", title: "تفاصيل النسخة" },
    ],
  },
  "shared-1": {
    id: "shared-1",
    name: "EA SPORTS FC",
    kind: "shared",
    label: "حساب PC مشترك",
    platform: "Steam PC",
    category: "رياضة",
    price: 29,
    oldPrice: 49,
    description:
      "حساب مشترك للعبة على الكمبيوتر. بعد الطلب تصلك بيانات الحساب وخطوات الدخول والاستخدام بشكل واضح.",
    delivery: "بيانات الحساب ترسل بعد تأكيد الطلب",
    ownership: "حساب مشترك وليس حسابًا خاصًا",
    usage: "الاستخدام حسب التعليمات المرسلة",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "طريقة الاستلام" },
      { image: "", title: "بيانات المنتج" },
    ],
  },
  "shared-2": {
    id: "shared-2",
    name: "GTA V",
    kind: "shared",
    label: "حساب PC مشترك",
    platform: "Rockstar PC",
    category: "عالم مفتوح",
    price: 19,
    oldPrice: 39,
    description:
      "حساب مشترك للعبة GTA V على الكمبيوتر. تستلم بيانات الحساب مع خطوات الدخول والتشغيل.",
    delivery: "بيانات الحساب ترسل بعد تأكيد الطلب",
    ownership: "حساب مشترك وليس حسابًا خاصًا",
    usage: "الاستخدام حسب التعليمات المرسلة",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "العالم المفتوح" },
      { image: "", title: "تفاصيل الحساب" },
    ],
  },
  "shared-3": {
    id: "shared-3",
    name: "Forza Horizon",
    kind: "shared",
    label: "حساب PC مشترك",
    platform: "Xbox PC",
    category: "سباقات",
    price: 35,
    oldPrice: 59,
    description:
      "حساب مشترك للعبة Forza Horizon على الكمبيوتر مع بيانات الدخول وتعليمات الاستخدام.",
    delivery: "بيانات الحساب ترسل بعد تأكيد الطلب",
    ownership: "حساب مشترك وليس حسابًا خاصًا",
    usage: "الاستخدام حسب التعليمات المرسلة",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "عالم السباقات" },
      { image: "", title: "تفاصيل الحساب" },
    ],
  },
  "private-1": {
    id: "private-1",
    name: "Call of Duty",
    kind: "private",
    label: "حساب PC خاص",
    platform: "حساب خاص",
    category: "أكشن",
    price: 149,
    oldPrice: 199,
    description:
      "حساب خاص للعبة ببيانات دخول مستقلة. يتم إرسال الحساب وتفاصيل الاستلام بعد إتمام الطلب.",
    delivery: "تسليم بيانات الحساب بعد تأكيد الطلب",
    ownership: "حساب خاص ببيانات مستقلة",
    usage: "يمكن تحديث البيانات حسب التعليمات",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "تفاصيل الحساب" },
      { image: "", title: "طريقة الاستلام" },
    ],
  },
  "private-2": {
    id: "private-2",
    name: "Red Dead Redemption",
    kind: "private",
    label: "حساب PC خاص",
    platform: "حساب خاص",
    category: "مغامرات",
    price: 119,
    oldPrice: 169,
    description:
      "حساب خاص للعبة Red Dead Redemption ببيانات دخول مستقلة وتسليم رقمي بعد الطلب.",
    delivery: "تسليم بيانات الحساب بعد تأكيد الطلب",
    ownership: "حساب خاص ببيانات مستقلة",
    usage: "يمكن تحديث البيانات حسب التعليمات",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "العالم المفتوح" },
      { image: "", title: "تفاصيل الحساب" },
    ],
  },
  "private-3": {
    id: "private-3",
    name: "Cyber Adventure",
    kind: "private",
    label: "حساب PC خاص",
    platform: "حساب خاص",
    category: "مغامرات",
    price: 89,
    oldPrice: 129,
    description:
      "حساب خاص للعبة ببيانات مستقلة، مع إرسال تفاصيل الدخول والاستخدام بعد إتمام الطلب.",
    delivery: "تسليم بيانات الحساب بعد تأكيد الطلب",
    ownership: "حساب خاص ببيانات مستقلة",
    usage: "يمكن تحديث البيانات حسب التعليمات",
    gallery: [
      { image: "", title: "غلاف اللعبة" },
      { image: "", title: "لقطة من اللعبة" },
      { image: "", title: "تفاصيل الحساب" },
    ],
  },
};

export default function GameDetailsPage() {
  const params = useParams<{ id: string }>();
  const game = games[params.id];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!game) return;

    try {
      const saved = localStorage.getItem("zeta_favorites");
      const ids = saved ? JSON.parse(saved) : [];
      setFavorite(Array.isArray(ids) && ids.includes(game.id));
    } catch {
      setFavorite(false);
    }
  }, [game]);

  const similarGames = useMemo(() => {
    if (!game) return [];

    return Object.values(games)
      .filter(
        (item) =>
          item.id !== game.id &&
          (item.kind === game.kind || item.category === game.category)
      )
      .slice(0, 4);
  }, [game]);

  function nextSlide() {
    if (!game) return;
    setCurrentSlide((slide) => (slide + 1) % game.gallery.length);
  }

  function previousSlide() {
    if (!game) return;
    setCurrentSlide(
      (slide) => (slide - 1 + game.gallery.length) % game.gallery.length
    );
  }

  function showMessage(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2200);
  }

  function addToCart() {
    if (!game) return;

    try {
      const saved = localStorage.getItem("zeta_cart");
      const cart = saved ? JSON.parse(saved) : [];
      const safeCart = Array.isArray(cart) ? cart : [];
      const existing = safeCart.some(
        (item: { id: string }) => item.id === game.id
      );

      const updatedCart = existing
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

      setAdding(true);
      showMessage(`تمت إضافة ${game.name} إلى السلة`);
      window.setTimeout(() => setAdding(false), 650);
    } catch {
      showMessage("تعذر إضافة اللعبة إلى السلة");
    }
  }

  function toggleFavorite() {
    if (!game) return;

    try {
      const saved = localStorage.getItem("zeta_favorites");
      const ids: string[] = saved ? JSON.parse(saved) : [];
      const safeIds = Array.isArray(ids) ? ids : [];

      const updated = safeIds.includes(game.id)
        ? safeIds.filter((id) => id !== game.id)
        : [...safeIds, game.id];

      localStorage.setItem("zeta_favorites", JSON.stringify(updated));
      setFavorite(updated.includes(game.id));

      window.dispatchEvent(
        new CustomEvent("zeta-favorites-updated", {
          detail: updated,
        })
      );

      showMessage(
        updated.includes(game.id)
          ? "تمت إضافة اللعبة إلى المفضلة"
          : "تمت إزالة اللعبة من المفضلة"
      );
    } catch {
      showMessage("تعذر تحديث المفضلة");
    }
  }

  async function shareGame() {
    if (!game) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: game.name,
          text: `شاهد ${game.name} على متجر ZETA`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showMessage("تم نسخ رابط اللعبة");
      }
    } catch {
      // المستخدم أغلق المشاركة.
    }
  }

  if (!game) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white"
      >
        <div className="text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-violet-500/10 text-5xl">
            🎮
          </div>

          <h1 className="mt-5 text-2xl font-black">
            اللعبة غير موجودة
          </h1>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-violet-600 px-6 py-3 text-sm font-black"
          >
            العودة للمتجر
          </Link>
        </div>
      </main>
    );
  }

  const discount = Math.round(
    ((game.oldPrice - game.price) / game.oldPrice) * 100
  );

  const activeSlide = game.gallery[currentSlide];

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-700/12 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black">
              Z
            </div>

            <div>
              <p className="text-base font-black tracking-wider">
                ZETA
              </p>
              <p className="text-[9px] text-gray-500">
                تفاصيل المنتج
              </p>
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

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-5 sm:py-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <div>
            <div className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[#100d18] shadow-[0_28px_90px_rgba(76,29,149,0.24)]">
              <div className="relative aspect-[16/12] min-h-[330px] overflow-hidden sm:min-h-[430px]">
                {activeSlide.image ? (
                  <img
                    src={activeSlide.image}
                    alt={`${game.name} - ${activeSlide.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_60%_28%,rgba(139,92,246,0.42),transparent_38%),linear-gradient(145deg,#24113c,#0c0a12_72%)]">
                    <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-violet-300/15" />
                    <div className="absolute right-10 top-10 h-32 w-32 rounded-full border border-fuchsia-300/10" />

                    <div className="text-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[34px] border border-white/10 bg-white/[0.06] text-6xl shadow-2xl backdrop-blur-xl">
                        🎮
                      </div>

                      <p className="mt-5 text-sm font-black text-violet-200">
                        {activeSlide.title}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09070e] via-transparent to-black/10" />

                <span className="absolute right-4 top-4 rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-black backdrop-blur-xl">
                  {game.label}
                </span>

                <span className="absolute left-4 top-4 rounded-xl bg-red-500 px-3 py-2 text-[10px] font-black shadow-lg shadow-red-950/20">
                  -{discount}%
                </span>

                <button
                  type="button"
                  onClick={previousSlide}
                  aria-label="الصورة السابقة"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-xl backdrop-blur-xl transition hover:bg-violet-600/60 active:scale-90"
                >
                  ›
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="الصورة التالية"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/45 text-xl backdrop-blur-xl transition hover:bg-violet-600/60 active:scale-90"
                >
                  ‹
                </button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {game.gallery.map((slide, index) => (
                    <button
                      key={slide.title}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`عرض ${slide.title}`}
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === index
                          ? "w-8 bg-white"
                          : "w-2 bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {game.gallery.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`عرض الصورة ${index + 1}`}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl border transition-all duration-300 ${
                    currentSlide === index
                      ? "scale-[1.03] border-violet-400 shadow-lg shadow-violet-950/30"
                      : "border-white/10 opacity-70 hover:opacity-100"
                  }`}
                >
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/30 to-[#14111d] text-3xl">
                      🎮
                    </div>
                  )}

                  {currentSlide === index && (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-violet-300/40" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-[30px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0e0c14] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:p-7 lg:sticky lg:top-20">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
              <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-violet-300">
                {game.category}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-400">
                {game.platform}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              {game.name}
            </h1>

            <p className="mt-4 text-sm leading-8 text-gray-400">
              {game.description}
            </p>

            <div className="mt-6 flex items-end justify-between gap-4 border-y border-white/[0.07] py-5">
              <div>
                <p className="text-[10px] text-gray-500">
                  السعر
                </p>

                <p className="mt-1 text-3xl font-black">
                  {game.price}
                  <span className="mr-1 text-xs text-gray-400">
                    ر.س
                  </span>
                </p>

                <p className="mt-1 text-xs text-gray-600 line-through">
                  {game.oldPrice} ر.س
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-[10px] font-black text-emerald-300">
                وفر {game.oldPrice - game.price} ر.س
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                  ⚡
                </span>

                <div>
                  <p className="text-xs font-black">
                    طريقة الاستلام
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {game.delivery}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                  🔐
                </span>

                <div>
                  <p className="text-xs font-black">
                    نوع الملكية
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {game.ownership}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                  📄
                </span>

                <div>
                  <p className="text-xs font-black">
                    تعليمات الاستخدام
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {game.usage}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black shadow-xl shadow-violet-950/30 transition active:scale-[0.98] ${
                adding ? "scale-[0.98] brightness-125" : ""
              }`}
            >
              <span>
                {adding ? "تمت الإضافة ✓" : "أضف للسلة"}
              </span>
              <span>🛒</span>
            </button>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={toggleFavorite}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black transition active:scale-95 ${
                  favorite
                    ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                    : "border-white/10 bg-white/5 text-gray-300"
                }`}
              >
                <span className="text-lg">
                  {favorite ? "♥" : "♡"}
                </span>
                <span>
                  {favorite ? "في المفضلة" : "المفضلة"}
                </span>
              </button>

              <button
                type="button"
                onClick={shareGame}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-300 transition active:scale-95"
              >
                <span className="text-lg">↗</span>
                <span>مشاركة</span>
              </button>
            </div>
          </aside>
        </div>

        <section className="mt-8 rounded-[30px] border border-white/[0.08] bg-[#111019] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-xl">
              🎮
            </div>

            <div>
              <p className="text-[10px] font-bold text-violet-400">
                عن المنتج
              </p>
              <h2 className="text-xl font-black">
                معلومات مهمة قبل الشراء
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-sm leading-8 text-gray-400">
            <p>
              هذا المنتج رقمي ولا يوجد شحن مادي. بعد تأكيد الطلب يتم إرسال
              بيانات الاستلام أو معلومات المنتج حسب النوع الموضح في الصفحة.
            </p>

            <p>
              تأكد من قراءة نوع المنتج والمنصة قبل إتمام الطلب، لأن الحساب
              المشترك يختلف عن الحساب الخاص والنسخة الرقمية.
            </p>

            <p>
              عند وجود أي مشكلة في الاستلام، تواصل مع الدعم مع رقم الطلب
              ليتم التحقق منها.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-violet-400">
                اختيارات مشابهة
              </p>

              <h2 className="mt-1 text-2xl font-black">
                منتجات قد تعجبك
              </h2>
            </div>

            <Link
              href="/"
              className="text-xs font-black text-gray-500"
            >
              عرض الكل
            </Link>
          </div>

          <div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible">
            {similarGames.map((item) => (
              <Link
                key={item.id}
                href={`/game/${item.id}`}
                className="group min-w-[75%] snap-start overflow-hidden rounded-[26px] border border-white/[0.08] bg-gradient-to-br from-[#171322] to-[#0f0d16] transition duration-300 hover:-translate-y-1 hover:border-violet-400/35 sm:min-w-[270px] md:min-w-0"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/15 text-5xl transition duration-300 group-hover:scale-105">
                  🎮
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-black text-violet-400">
                    {item.label}
                  </p>

                  <h3 className="mt-1 line-clamp-1 text-sm font-black">
                    {item.name}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-black">
                      {item.price}
                      <span className="mr-1 text-[9px] text-gray-500">
                        ر.س
                      </span>
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg">
                      ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </section>

      <footer className="relative mt-12 overflow-hidden border-t border-white/[0.06] bg-[#0b0911] pb-32 pt-12">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-700/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500 to-fuchsia-700 text-4xl font-black shadow-2xl shadow-violet-900/40">
              Z
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-[5px]">
              ZETA
            </h2>

            <p className="mt-2 max-w-xs text-xs leading-6 text-gray-500">
              وجهتك للألعاب الرقمية بأسعار مميزة وتجربة شراء سريعة وآمنة.
            </p>
          </div>

          <div className="mt-9 text-center">
            <h3 className="text-base font-black">
              تواصل معنا
            </h3>

            <div className="mt-5 flex justify-center gap-4">
              <a
                href="#"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 text-2xl transition hover:bg-violet-600/20"
              >
                ✈️
              </a>

              <a
                href="#"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 text-2xl transition hover:bg-violet-600/20"
              >
                💬
              </a>

              <a
                href="mailto:support@zeta.com"
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 text-2xl transition hover:bg-violet-600/20"
              >
                ✉️
              </a>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-black">
                روابط مهمة
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
                <Link href="/about">من نحن</Link>
                <Link href="/faq">الأسئلة الشائعة</Link>
                <a href="#">تواصل معنا</a>
                <a href="#">تتبع الطلب</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">
                السياسات
              </h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
                <Link href="/terms">الشروط والأحكام</Link>
                <Link href="/privacy">سياسة الخصوصية</Link>
                <Link href="/returns">سياسة الإرجاع</Link>
                <Link href="/usage-policy">سياسة الاستخدام</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-7">
            <h3 className="text-center text-sm font-black">
              طرق الدفع
            </h3>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <div className="flex h-11 w-24 items-center justify-center rounded-xl bg-white">
                <span className="text-base font-black text-black">
                   Pay
                </span>
              </div>

              <div className="flex h-11 w-20 items-center justify-center rounded-xl bg-white">
                <span className="text-base font-black italic text-[#1A1F71]">
                  VISA
                </span>
              </div>

              <div className="flex h-11 w-28 items-center justify-center rounded-xl bg-white">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-red-600" />
                  <div className="-ml-1.5 h-4 w-4 rounded-full bg-orange-400" />
                  <span className="ml-2 text-[11px] font-bold text-gray-800">
                    Mastercard
                  </span>
                </div>
              </div>

              <div className="flex h-11 w-20 items-center justify-center rounded-xl bg-white">
                <span className="text-base font-black text-sky-500">
                  مدى
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-6 text-center">
            <p className="text-[11px] text-gray-600">
              جميع الحقوق محفوظة © 2026 ZETA
            </p>
          </div>
        </div>
      </footer>

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