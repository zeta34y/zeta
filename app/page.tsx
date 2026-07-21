"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const games = [
  {
    id: 1,
    name: "EA SPORTS FC 26",
    category: "رياضة",
    price: 189,
    oldPrice: 249,
    image: "",
  },
  {
    id: 2,
    name: "Call of Duty",
    category: "أكشن",
    price: 159,
    oldPrice: 219,
    image: "",
  },
  {
    id: 3,
    name: "Grand Theft Auto V",
    category: "عالم مفتوح",
    price: 79,
    oldPrice: 129,
    image: "",
  },
  {
    id: 4,
    name: "Forza Horizon",
    category: "سباقات",
    price: 139,
    oldPrice: 199,
    image: "",
  },
];

const categories = [
  { name: "الكل", icon: "🎮" },
  { name: "محاكي", icon: "🕹️" },
  { name: "رياضة", icon: "⚽" },
  { name: "أكشن", icon: "🔥" },
  { name: "2D", icon: "👾" },
  { name: "مغامرات", icon: "🗺️" },
  { name: "رعب", icon: "👻" },
];

const sharedGames = [
  {
    id: 1,
    name: "EA SPORTS FC",
    platform: "Steam PC",
    price: 29,
    oldPrice: 49,
    image: "",
  },
  {
    id: 2,
    name: "GTA V",
    platform: "Rockstar PC",
    price: 19,
    oldPrice: 39,
    image: "",
  },
  {
    id: 3,
    name: "Forza Horizon",
    platform: "Xbox PC",
    price: 35,
    oldPrice: 59,
    image: "",
  },
];

const privateGames = [
  {
    id: 1,
    name: "Call of Duty",
    platform: "حساب خاص",
    price: 149,
    oldPrice: 199,
    image: "",
  },
  {
    id: 2,
    name: "Red Dead Redemption",
    platform: "حساب خاص",
    price: 119,
    oldPrice: 169,
    image: "",
  },
  {
    id: 3,
    name: "Cyber Adventure",
    platform: "حساب خاص",
    price: 89,
    oldPrice: 129,
    image: "",
  },
];

const reviews = [
  {
    id: 1,
    name: "عبدالله محمد",
    text: "المتجر سريع جدًا، استلمت اللعبة مباشرة والتعامل ممتاز.",
    rating: 5,
  },
  {
    id: 2,
    name: "سعد العتيبي",
    text: "الأسعار ممتازة والدعم رد علي بسرعة، تجربة تستحق التقييم.",
    rating: 5,
  },
  {
    id: 3,
    name: "فيصل أحمد",
    text: "اشتريت حساب لعبة ووصلتني البيانات بشكل مرتب وواضح.",
    rating: 5,
  },
];

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashClosing, setSplashClosing] = useState(false);
  const [activeCategory, setActiveCategory] = useState("الكل");

  useEffect(() => {
    const closeTimer = window.setTimeout(() => {
      setSplashClosing(true);
    }, 1600);

    const hideTimer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (showSplash) {
    return (
      <main
        dir="rtl"
        className={`fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-[#07050c] transition-all duration-500 ${
          splashClosing
            ? "pointer-events-none scale-105 opacity-0 blur-sm"
            : "scale-100 opacity-100"
        }`}
      >
        <div className="absolute h-[310px] w-[310px] animate-pulse rounded-full bg-violet-700/35 blur-[95px]" />
        <div className="absolute ml-28 mb-28 h-44 w-44 animate-pulse rounded-full bg-fuchsia-600/20 blur-[75px]" />

        <div className="relative z-10 flex animate-[splashEnter_700ms_cubic-bezier(0.22,1,0.36,1)_both] flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-3 animate-pulse rounded-[42px] border border-violet-300/30 shadow-[0_0_45px_rgba(139,92,246,0.45)]" />

            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[34px] border border-white/15 bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-[0_25px_70px_rgba(88,28,135,0.55)]">
              <span className="-skew-x-6 text-7xl font-black leading-none text-white drop-shadow-2xl">
                Z
              </span>

              <div className="absolute -inset-[70%] animate-[shine_1200ms_ease_500ms_both] bg-[linear-gradient(110deg,transparent_42%,rgba(255,255,255,0.55)_50%,transparent_58%)]" />
            </div>
          </div>

          <h1 className="mt-6 animate-[fadeUp_500ms_ease_450ms_both] text-3xl font-black tracking-[8px] text-white">
            ZETA
          </h1>

          <p className="mt-2 animate-[fadeUp_500ms_ease_650ms_both] text-sm text-violet-300">
            عالمك يبدأ من هنا
          </p>

          <div className="mt-7 h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[45%] animate-[loadingBar_900ms_ease-in-out_700ms_infinite] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 shadow-[0_0_16px_rgba(168,85,247,0.75)]" />
          </div>
        </div>

        <style jsx global>{`
          @keyframes splashEnter {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.78) rotate(-8deg);
            }
            70% {
              opacity: 1;
              transform: translateY(0) scale(1.06) rotate(2deg);
            }
            100% {
              transform: translateY(0) scale(1) rotate(0);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shine {
            from {
              transform: translateX(-55%) rotate(12deg);
            }
            to {
              transform: translateX(55%) rotate(12deg);
            }
          }

          @keyframes loadingBar {
            0% {
              transform: translateX(170%);
            }
            50% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-170%);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-28 text-white"
    >

      {/* شريط عرض افتتاح المتجر */}
      <div className="relative z-[60] overflow-hidden border-0 bg-gradient-to-l from-violet-700 via-fuchsia-600 to-violet-700 py-2 text-white">
        <div className="discount-track flex min-w-max items-center gap-8 whitespace-nowrap text-[11px] font-black sm:text-xs">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <span>🎉 افتتاح متجر ZETA</span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                خصم 10%
              </span>
              <span>
                استخدم الكود:
                <strong className="mr-1 tracking-wider text-yellow-300">
                  ZETA10
                </strong>
              </span>
              <span className="text-white/50">✦</span>
            </div>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-0 bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-700/30">
              Z
            </div>

            <div>
              <h1 className="text-xl font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-400">
                متجر الألعاب الرقمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <span className="text-xl">🛒</span>
              <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold">
                0
              </span>
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <span className="text-xl">👤</span>
            </button>
          </div>
        </div>

      </header>

      <div className="mx-auto max-w-7xl">
       <section className="relative z-10 overflow-hidden bg-transparent px-4 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3.5 shadow-lg">
            <span className="text-xl">⌕</span>

            <input
              type="text"
              placeholder="ابحث عن لعبتك المفضلة..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />

            <button className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold transition duration-200 hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-900/30 active:scale-95">
              بحث
            </button>
          </div>
        </section>

        <section className="px-4 pt-5">
          <div className="hero-card relative min-h-[310px] overflow-hidden rounded-[30px] border-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.45),transparent_42%),linear-gradient(135deg,#12101e,#08070d)]" />

            <div className="absolute -left-14 -top-12 h-52 w-52 rounded-full border border-violet-400/20" />
            <div className="absolute -left-5 top-14 h-32 w-32 rounded-full border border-fuchsia-400/10" />

            <div className="relative z-10 flex min-h-[310px] flex-col justify-center p-6">
              <span className="mb-3 w-fit rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-300">
                عروض محدودة 🔥
              </span>

              <h2 className="max-w-[290px] text-3xl font-black leading-tight sm:text-5xl">
                ألعابك المفضلة
                <span className="block bg-gradient-to-l from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  بأسعار أقوى
                </span>
              </h2>

              <p className="mt-3 max-w-[310px] text-sm leading-6 text-gray-400">
                اشترِ ألعابك الرقمية بسرعة، واستلمها مباشرة بعد الدفع.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button className="rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-black shadow-xl shadow-violet-800/30 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-95">
                  تسوق الآن
                </button>

                <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-bold transition duration-200 hover:border-violet-400/50 hover:bg-violet-500/10 hover:text-violet-200 active:scale-95">
                  اكتشف العروض
                </button>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 hidden h-40 w-40 rotate-6 items-center justify-center rounded-[38px] border border-white/10 bg-white/5 text-7xl shadow-2xl backdrop-blur-md sm:flex">
              🎮
            </div>
          </div>
        </section>

      <section className="relative z-10 overflow-hidden bg-transparent pt-7">
          <div className="flex items-center justify-between px-4">
            <div>
              <p className="text-xs font-bold text-violet-400">
                تصفح حسب ذوقك
              </p>
              <h2 className="mt-1 text-xl font-black">التصنيفات</h2>
            </div>

            <button className="text-xs font-bold text-gray-400">
              عرض الكل
            </button>
          </div>

         <div className="scroll-clip mt-4">
           <div className="category-scroll flex flex-nowrap gap-3 overflow-x-auto bg-transparent px-4 pb-4 md:flex-wrap md:overflow-visible">
            {categories.map((category) => {
              const slug =
                category.name === "محاكي"
                  ? "simulation"
                  : category.name === "رياضة"
                  ? "sports"
                  : category.name === "أكشن"
                  ? "action"
                  : category.name === "2D"
                  ? "2d"
                  : category.name === "مغامرات"
                  ? "adventure"
                  : category.name === "رعب"
                  ? "horror"
                  : "";

              if (category.name === "الكل") {
                return (
              <button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`flex min-w-[108px] items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-500/15 hover:text-white hover:shadow-lg hover:shadow-violet-900/20 active:scale-95 sm:min-w-fit sm:px-4 sm:py-3 ${
                  activeCategory === category.name
                    ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                    : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
                );
              }

              return (
                <Link key={category.name} href={`/categories?category=${slug}`} className={`flex min-w-[108px] items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-500/15 hover:text-white hover:shadow-lg hover:shadow-violet-900/20 active:scale-95 sm:min-w-fit sm:px-4 sm:py-3 ${activeCategory === category.name ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/30" : "border-white/10 bg-white/[0.04] text-gray-300"}`}>
                  <span className="text-[19px] leading-none sm:text-base">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              );
            })}
           </div>
          </div>
        </section>

        <section className="px-4 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-violet-400">
                الأكثر طلبًا
              </p>
              <h2 className="mt-1 text-xl font-black">ألعاب مميزة</h2>
            </div>

            <button className="text-xs font-bold text-gray-400">
              عرض المزيد
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              const discount = Math.round(
                ((game.oldPrice - game.price) / game.oldPrice) * 100
              );

              return (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111019] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-950/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl">🎮</div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#111019] via-transparent to-transparent" />

                    <span className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-black">
                      -{discount}%
                    </span>

                    <button className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm backdrop-blur-md">
                      ♡
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-bold text-violet-400">
                      {game.category}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-sm font-black">
                      {game.name}
                    </h3>

                    <div className="mt-3 flex items-center justify-between">
                      <div><span className="text-sm text-violet-300 font-bold">السعر قريبًا</span></div>

                      <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold">
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>


      {/* الألعاب المشتركة */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-bold text-violet-300">
              أسعار اقتصادية
            </span>

            <h2 className="mt-3 text-2xl font-black">ألعاب PC مشتركة</h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              استمتع بأفضل الألعاب بسعر أقل
            </p>
          </div>

          <button className="text-xs font-bold text-violet-400">
            عرض الكل
          </button>
        </div>

        <div className="scroll-clip">
         <div className="smooth-scroll flex snap-x gap-3 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible">
          {sharedGames.map((game) => (
            <article
              key={game.id}
              className="group min-w-[72%] snap-start overflow-hidden rounded-[26px] md:min-w-0 border border-violet-500/15 bg-[#12101a] transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-950/40 sm:min-w-[290px]"
            >
              <div className="relative h-44 overflow-hidden">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl">🎮</div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#12101a] via-transparent to-black/20" />

                <span className="absolute right-3 top-3 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md">
                  مشترك
                </span>
              </div>

              <div className="p-4">
                <p className="text-[11px] font-bold text-violet-400">
                  {game.platform}
                </p>

                <h3 className="mt-1 text-lg font-black">{game.name}</h3>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div>
                      <span className="text-xl font-black">{game.price}</span>
                      <span className="mr-1 text-xs text-gray-400">ر.س</span>
                    </div>

                    <span className="text-xs text-gray-600 line-through">
                      {game.oldPrice} ر.س
                    </span>
                  </div>

                  <button className="rounded-2xl bg-violet-600 px-5 py-3 text-xs font-black shadow-lg shadow-violet-900/30 transition active:scale-95">
                    أضف للسلة
                  </button>
                </div>
              </div>
            </article>
          ))}
         </div>
        </div>
      </section>

      {/* الألعاب الخاصة */}
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-bold text-fuchsia-300">
              ملكية خاصة
            </span>

            <h2 className="mt-3 text-2xl font-black">ألعاب PC خاصة</h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              حساب خاص بك مع بيانات دخول مستقلة
            </p>
          </div>

          <button className="text-xs font-bold text-fuchsia-400">
            عرض الكل
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {privateGames.map((game) => (
            <article
              key={game.id}
              className="group overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/50 hover:shadow-2xl hover:shadow-fuchsia-950/30"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl">🎮</div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#121019] via-transparent to-transparent" />

                <span className="absolute right-2 top-2 rounded-lg bg-gradient-to-l from-fuchsia-600 to-violet-600 px-2 py-1 text-[9px] font-black">
                  خاص
                </span>
              </div>

              <div className="p-3">
                <p className="text-[10px] font-bold text-fuchsia-400">
                  {game.platform}
                </p>

                <h3 className="mt-1 line-clamp-1 text-sm font-black">
                  {game.name}
                </h3>

                <div className="mt-3 flex items-center justify-between">
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

                  <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-600 text-lg font-black transition active:scale-90">
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* تقييمات العملاء */}
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="text-center">
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-bold text-violet-300">
            تجارب حقيقية
          </span>

          <h2 className="mt-4 text-2xl font-black">آراء عملائنا</h2>

          <p className="mt-2 text-sm text-gray-500">
            رضاكم هو أهم إنجاز لنا
          </p>
        </div>

        <div className="scroll-clip mt-6">
         <div className="smooth-scroll flex snap-x gap-4 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="relative min-w-[88%] snap-center overflow-hidden rounded-[28px] md:min-w-0 border border-violet-400/15 bg-gradient-to-br from-[#171322] to-[#0f0d16] p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-2xl hover:shadow-violet-950/30 sm:min-w-[360px]"
            >
              <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-violet-600/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-black">
                    {review.name.charAt(0)}
                  </div>

                  <span className="text-5xl font-black text-violet-500/20">
                    “
                  </span>
                </div>

                <p className="mt-5 min-h-[70px] text-sm leading-7 text-gray-300">
                  {review.text}
                </p>

                <div className="mt-5 border-t border-white/5 pt-4">
                  <h3 className="text-sm font-black">{review.name}</h3>

                  <div className="mt-2 flex gap-1 text-sm text-amber-400">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <span key={index}>★</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
         </div>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="relative mt-14 overflow-hidden border-t border-white/[0.06] bg-[#0b0911] pb-32 pt-10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-700/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-violet-500 to-fuchsia-700 text-4xl font-black shadow-2xl shadow-violet-900/40">
              Z
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-[5px]">ZETA</h2>

            <p className="mt-2 max-w-xs text-xs leading-6 text-gray-500">
              وجهتك للألعاب الرقمية بأسعار مميزة وتجربة شراء سريعة وآمنة.
            </p>
          </div>

          <div className="mt-9">
<h3 className="text-center text-base font-black">تواصل معنا</h3>
<div className="mt-5 flex justify-center gap-4">
<a href="#" className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 hover:bg-violet-600/20 transition text-2xl">✈️</a>
<a href="#" className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 hover:bg-violet-600/20 transition text-2xl">💬</a>
<a href="mailto:support@zeta.com" className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-white/5 hover:bg-violet-600/20 transition text-2xl">✉️</a>
</div>
</div>

<div className="mt-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-black text-white">روابط مهمة</h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
                <a href="#">من نحن</a>
                <a href="#">الأسئلة الشائعة</a>
                <a href="#">تواصل معنا</a>
                <a href="#">تتبع الطلب</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">السياسات</h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
                <a href="#">الشروط والأحكام</a>
                <a href="#">سياسة الخصوصية</a>
                <a href="#">سياسة الاسترجاع</a>
                <a href="#">سياسة الاستخدام</a>
              </div>
            </div>
          </div>

        <div className="mt-8 border-t border-white/10 pt-6">
  <h3 className="mb-4 text-center text-sm font-black text-white">
    وسائل الدفع
  </h3>

  <div className="flex flex-wrap items-center justify-center gap-3">

    <div className="flex h-11 w-24 items-center justify-center rounded-xl bg-white shadow-md transition hover:scale-105">
      <span className="text-base font-black tracking-tight text-black">
         Pay
      </span>
    </div>

    <div className="flex h-11 w-20 items-center justify-center rounded-xl bg-white shadow-md transition hover:scale-105">
      <span className="text-base font-black italic text-[#1A1F71]">
        VISA
      </span>
    </div>

    <div className="flex h-11 w-28 items-center justify-center rounded-xl bg-white shadow-md transition hover:scale-105">
      <div className="flex items-center">
        <div className="h-4 w-4 rounded-full bg-red-600"></div>
        <div className="-ml-1.5 h-4 w-4 rounded-full bg-orange-400"></div>
        <span className="ml-2 text-[11px] font-bold text-gray-800">
          Mastercard
        </span>
      </div>
    </div>

    <div className="flex h-11 w-20 items-center justify-center rounded-xl bg-white shadow-md transition hover:scale-105">
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




      {/* القائمة السفلية العائمة */}
      <nav className="fixed bottom-3 left-3 right-3 z-[100] mx-auto max-w-md rounded-[28px] border border-violet-300/20 bg-gradient-to-l from-violet-700/95 via-fuchsia-600/95 to-violet-700/95 p-2 shadow-[0_18px_50px_rgba(76,29,149,0.48)] backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          <button
            aria-label="الرئيسية"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] bg-white/15 text-white shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-2 hover:bg-white/20 hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[24px] w-[24px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.7 12 3.8l8.5 6.9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9.7v9.2h13V9.7M9.2 18.9v-5.4h5.6v5.4" />
            </svg>
            <span className="text-[9px] font-black">الرئيسية</span>
          </button>

          <Link
            href="/categories"
            aria-label="التصنيفات"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="2" />
              <rect x="14" y="3.5" width="6.5" height="6.5" rx="2" />
              <rect x="3.5" y="14" width="6.5" height="6.5" rx="2" />
              <rect x="14" y="14" width="6.5" height="6.5" rx="2" />
            </svg>
            <span className="text-[9px] font-black">التصنيفات</span>
          </Link>

          <button
            aria-label="السلة"
            className="group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 4.5h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4l1.4-5.3H7" />
              <circle cx="9.5" cy="19.2" r="1.2" />
              <circle cx="17.2" cy="19.2" r="1.2" />
            </svg>
            <span className="absolute right-[24%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white">
              0
            </span>
            <span className="text-[9px] font-black">السلة</span>
          </button>

          <button
            aria-label="تسجيل الدخول"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <circle cx="12" cy="7.2" r="3.2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.8 20c.5-4 2.8-6.2 6.2-6.2s5.7 2.2 6.2 6.2" />
            </svg>
            <span className="text-[9px] font-black">الدخول</span>
          </button>

          <button
            aria-label="البحث"
            className="group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <circle cx="10.8" cy="10.8" r="5.8" />
              <path strokeLinecap="round" d="m15.2 15.2 4.3 4.3" />
            </svg>
            <span className="text-[9px] font-black">بحث</span>
          </button>
        </div>
      </nav>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #08070d;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          overflow-x: hidden;
          background: #08070d;
        }

        button,
        input {
          font-family: inherit;
        }

        button,
        a {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid rgba(167, 139, 250, 0.9);
          outline-offset: 3px;
        }

        article {
          -webkit-tap-highlight-color: transparent;
        }

        .discount-track {
          animation: discountScroll 20s linear infinite;
          will-change: transform;
        }

        .scroll-clip {
          overflow: hidden;
        }

        section,
        header,
        footer,
        nav {
          outline: none;
        }

        .category-scroll,
        .smooth-scroll,
        .scroll-clip {
          border: 0 !important;
          outline: 0 !important;
          box-shadow: none !important;
          background-clip: padding-box;
        }

        .hide-scrollbar,
        .category-scroll,
        .smooth-scroll {
          margin-bottom: -18px;
          padding-bottom: 18px;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        .hide-scrollbar::-webkit-scrollbar,
        .category-scroll::-webkit-scrollbar,
        .smooth-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }

        .category-scroll,
        .smooth-scroll {
          scrollbar-color: transparent transparent;
          overscroll-behavior-inline: contain;
          -webkit-overflow-scrolling: touch;
        }

        .zeta-logo {
          position: relative;
          display: flex;
          width: 120px;
          height: 120px;
          align-items: center;
          justify-content: center;
          border-radius: 36px;
          background: linear-gradient(135deg, #8b5cf6, #c026d3);
          box-shadow:
            0 0 30px rgba(139, 92, 246, 0.65),
            0 0 90px rgba(192, 38, 211, 0.3);
          animation: logoEntrance 1s ease-out forwards;
        }

        .zeta-logo::before {
          position: absolute;
          inset: 4px;
          content: "";
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 32px;
        }

        .zeta-logo span {
          font-size: 76px;
          font-weight: 1000;
          line-height: 1;
          color: white;
          transform: skewX(-8deg);
          text-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }

        .splash-loading {
          width: 45%;
          animation: loadingMove 1.2s ease-in-out infinite;
        }

        .hero-card {
          box-shadow: none !important;
          border: 0 !important;
          outline: 0 !important;
        }

        @keyframes discountScroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(50%);
          }
        }

        @keyframes logoEntrance {
          0% {
            opacity: 0;
            transform: scale(0.35) rotate(-15deg);
          }

          70% {
            transform: scale(1.08) rotate(3deg);
          }

          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes loadingMove {
          0% {
            transform: translateX(170%);
          }

          50% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-170%);
          }
        }


        @media (min-width: 768px) {
          .scroll-clip {
            overflow: visible;
          }

          .category-scroll,
          .smooth-scroll {
            margin-bottom: 0;
            padding-bottom: 0;
            overflow: visible !important;
          }
        }

        @media (max-width: 480px) {
          .hero-card {
            min-height: 270px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .discount-track,
          .zeta-logo,
          .splash-loading {
            animation: none;
          }

          * {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}