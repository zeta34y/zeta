"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useEffect, useRef, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const menuTouchStartX = useRef<number | null>(null);

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

  useEffect(() => {
    function updateCartCount() {
      try {
        const savedCart = localStorage.getItem("zeta_cart");
        const parsedCart = savedCart ? JSON.parse(savedCart) : [];

        const count = Array.isArray(parsedCart)
          ? parsedCart.reduce(
              (total: number, item: { quantity?: number }) =>
                total + Number(item.quantity || 1),
              0
            )
          : 0;

        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("zeta-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("zeta-cart-updated", updateCartCount);
    };
  }, []);

  useEffect(() => {
    function updateFavorites() {
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
    }

    updateFavorites();

    window.addEventListener("storage", updateFavorites);
    window.addEventListener(
      "zeta-favorites-updated",
      updateFavorites
    );

    return () => {
      window.removeEventListener("storage", updateFavorites);
      window.removeEventListener(
        "zeta-favorites-updated",
        updateFavorites
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function toggleFavorite(
    game: {
      id: number;
      name: string;
    },
    kind: "featured" | "shared" | "private"
  ) {
    const favoriteId = `${kind}-${game.id}`;

    try {
      const savedFavorites = localStorage.getItem("zeta_favorites");
      const parsedFavorites = savedFavorites
        ? JSON.parse(savedFavorites)
        : [];
      const safeFavorites = Array.isArray(parsedFavorites)
        ? parsedFavorites
        : [];

      const alreadyFavorite = safeFavorites.includes(favoriteId);

      const updatedFavorites = alreadyFavorite
        ? safeFavorites.filter((id: string) => id !== favoriteId)
        : [...safeFavorites, favoriteId];

      setFavorites(updatedFavorites);

      localStorage.setItem(
        "zeta_favorites",
        JSON.stringify(updatedFavorites)
      );

      window.dispatchEvent(
        new CustomEvent("zeta-favorites-updated", {
          detail: updatedFavorites,
        })
      );

      setFavoriteMessage(
        alreadyFavorite
          ? `تمت إزالة ${game.name} من المفضلة`
          : `تمت إضافة ${game.name} إلى المفضلة`
      );

      window.setTimeout(() => setFavoriteMessage(""), 2200);
    } catch {
      setFavoriteMessage("تعذر تحديث المفضلة");
      window.setTimeout(() => setFavoriteMessage(""), 2200);
    }
  }

  function animateGameToCart(sourceElement: HTMLElement) {
    const cartButton = document.getElementById("top-cart-button");

    if (!cartButton) return;

    const sourceRect = sourceElement.getBoundingClientRect();
    const cartRect = cartButton.getBoundingClientRect();

    const flyingGame = document.createElement("div");

    flyingGame.innerHTML = "🎮";
    flyingGame.setAttribute("aria-hidden", "true");

    Object.assign(flyingGame.style, {
      position: "fixed",
      left: `${sourceRect.left + sourceRect.width / 2 - 24}px`,
      top: `${sourceRect.top + sourceRect.height / 2 - 24}px`,
      width: "48px",
      height: "48px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "16px",
      background:
        "linear-gradient(135deg, rgba(124,58,237,0.96), rgba(192,38,211,0.96))",
      border: "1px solid rgba(255,255,255,0.24)",
      boxShadow: "0 16px 45px rgba(88,28,135,0.5)",
      fontSize: "25px",
      zIndex: "9999",
      pointerEvents: "none",
      willChange: "transform, opacity",
    });

    document.body.appendChild(flyingGame);

    const targetX =
      cartRect.left +
      cartRect.width / 2 -
      (sourceRect.left + sourceRect.width / 2);

    const targetY =
      cartRect.top +
      cartRect.height / 2 -
      (sourceRect.top + sourceRect.height / 2);

    const animation = flyingGame.animate(
      [
        {
          transform: "translate(0, 0) scale(1) rotate(0deg)",
          opacity: 1,
          offset: 0,
        },
        {
          transform: `translate(${targetX * 0.42}px, ${
            targetY * 0.32 - 95
          }px) scale(0.92) rotate(8deg)`,
          opacity: 1,
          offset: 0.45,
        },
        {
          transform: `translate(${targetX}px, ${targetY}px) scale(0.22) rotate(24deg)`,
          opacity: 0.15,
          offset: 1,
        },
      ],
      {
        duration: 1800,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      }
    );

    cartButton.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.18) rotate(-5deg)", offset: 0.55 },
        { transform: "scale(1)" },
      ],
      {
        duration: 1800,
        easing: "ease-out",
      }
    );

    animation.addEventListener("finish", () => {
      flyingGame.remove();
    });
  }

  function addToCart(
    game: {
      id: number;
      name: string;
      price: number;
      oldPrice?: number;
      platform?: string;
      image?: string;
    },
    kind: "featured" | "shared" | "private",
    sourceElement?: HTMLElement
  ) {
    if (sourceElement) {
      animateGameToCart(sourceElement);
    }
    const cartId = `${kind}-${game.id}`;

    try {
      const savedCart = localStorage.getItem("zeta_cart");
      const currentCart = savedCart ? JSON.parse(savedCart) : [];
      const safeCart = Array.isArray(currentCart) ? currentCart : [];

      const existingIndex = safeCart.findIndex(
        (item: { id: string }) => item.id === cartId
      );

      let updatedCart;

      if (existingIndex >= 0) {
        updatedCart = safeCart.map(
          (item: { id: string; quantity?: number }) =>
            item.id === cartId
              ? { ...item, quantity: Number(item.quantity || 1) + 1 }
              : item
        );
      } else {
        updatedCart = [
          ...safeCart,
          {
            id: cartId,
            name: game.name,
            price: game.price,
            oldPrice: game.oldPrice,
            platform: game.platform || "PC",
            image: game.image || "",
            quantity: 1,
          },
        ];
      }

      localStorage.setItem("zeta_cart", JSON.stringify(updatedCart));

      const updatedCount = updatedCart.reduce(
        (total: number, item: { quantity?: number }) =>
          total + Number(item.quantity || 1),
        0
      );

      setCartCount(updatedCount);
      window.dispatchEvent(
        new CustomEvent("zeta-cart-updated", {
          detail: updatedCart,
        })
      );

      setAddingId(cartId);
      setCartMessage(`تمت إضافة ${game.name} إلى السلة`);

      window.setTimeout(() => setAddingId(null), 550);
      window.setTimeout(() => setCartMessage(""), 2200);
    } catch (error) {
      console.error("تعذر إضافة اللعبة للسلة:", error);
      setCartMessage("تعذر إضافة اللعبة، حاول مرة أخرى");
      window.setTimeout(() => setCartMessage(""), 2200);
    }
  }

  function handleMenuTouchStart(event: React.TouchEvent<HTMLElement>) {
    menuTouchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleMenuTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (menuTouchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? menuTouchStartX.current;
    const swipeDistance = endX - menuTouchStartX.current;

    // القائمة في اليسار، والسحب لليسار يغلقها.
    if (swipeDistance < -55) {
      closeMenu();
    }

    menuTouchStartX.current = null;
  }

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
            <Link
              id="top-cart-button"
              href="/cart"
              aria-label="سلة المشتريات"
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
            >
              <span className="text-xl">🛒</span>
              <span
                key={cartCount}
                className="absolute -left-1 -top-1 flex h-5 min-w-5 animate-[cartBadgePop_260ms_ease-out] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold"
              >
                {cartCount}
              </span>
            </Link>

            <button
              aria-label="الحساب"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition active:scale-95"
            >
              <span className="text-xl">👤</span>
            </button>

            <button
              type="button"
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition duration-200 hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-6 w-6 fill-none stroke-current stroke-2"
              >
                <path
                  strokeLinecap="round"
                  d="M5 7h14M5 12h14M5 17h14"
                />
              </svg>
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
                  بأسعار رمزية
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
                <Link key={category.name} href={`/categories/${slug}`} className={`flex min-w-[108px] items-center justify-center gap-2.5 rounded-full border px-5 py-3.5 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-500/15 hover:text-white hover:shadow-lg hover:shadow-violet-900/20 active:scale-95 sm:min-w-fit sm:px-4 sm:py-3 ${activeCategory === category.name ? "border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-900/30" : "border-white/10 bg-white/[0.04] text-gray-300"}`}>
                  <span className="text-[19px] leading-none sm:text-base">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              );
            })}
           </div>
          </div>
        </section>

        <section id="new-games" className="scroll-mt-28 px-4 pt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-violet-400">
                جديدنا
              </p>
              <h2 className="mt-1 text-xl font-black">ألعاب مميزة</h2>
            </div>

            <button className="text-xs font-bold text-gray-400">
              عرض المزيد
            </button>
          </div>

          <div id="best-sellers" className="scroll-mt-28 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {games.map((game) => {
              const discount = Math.round(
                ((game.oldPrice - game.price) / game.oldPrice) * 100
              );

              return (
                <article
                  key={game.id}
                  className="group overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111019] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:shadow-2xl hover:shadow-violet-950/40"
                >
                  <div data-game-image className="relative aspect-[4/5] overflow-hidden">
                    <Link
                      href={`/game/featured-${game.id}`}
                      aria-label={`عرض تفاصيل ${game.name}`}
                      className="absolute inset-0 z-10"
                    />

                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl transition duration-300 group-hover:scale-105">
                      🎮
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111019] via-transparent to-transparent" />

                    <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-red-500 px-2 py-1 text-[10px] font-black">
                      -{discount}%
                    </span>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(game, "featured");
                      }}
                      aria-label={
                        favorites.includes(`featured-${game.id}`)
                          ? `إزالة ${game.name} من المفضلة`
                          : `إضافة ${game.name} للمفضلة`
                      }
                      aria-pressed={favorites.includes(
                        `featured-${game.id}`
                      )}
                      className={`absolute left-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-full border text-sm backdrop-blur-md transition duration-200 active:scale-90 ${
                        favorites.includes(`featured-${game.id}`)
                          ? "border-rose-400/40 bg-rose-500/25 text-rose-300 shadow-lg shadow-rose-950/30"
                          : "border-white/10 bg-black/40 text-white hover:bg-white/10"
                      }`}
                    >
                      {favorites.includes(`featured-${game.id}`)
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-[10px] font-bold text-violet-400">
                      {game.category}
                    </p>

                    <Link
                      href={`/game/featured-${game.id}`}
                      className="mt-1 block line-clamp-1 text-sm font-black transition hover:text-violet-300"
                    >
                      {game.name}
                    </Link>

                    <div className="mt-3 flex items-center justify-between">
                      <div><span className="text-sm text-violet-300 font-bold">السعر قريبًا</span></div>

                      <button
                        type="button"
                        aria-label={`إضافة ${game.name} للسلة`}
                        onClick={(event) =>
                          addToCart(
                            {
                              ...game,
                              platform: "PC",
                            },
                            "featured",
                            event.currentTarget
                          )
                        }
                        className={`relative z-30 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg font-bold transition duration-200 active:scale-90 ${
                          addingId === `featured-${game.id}`
                            ? "rotate-12 scale-90 brightness-125"
                            : "rotate-0 scale-100"
                        }`}
                      >
                        {addingId === `featured-${game.id}` ? "✓" : "+"}
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
      <section id="shared-games" className="scroll-mt-28 mx-auto max-w-7xl px-4 pt-12">
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
              <div data-game-image className="relative h-44 overflow-hidden">
                <Link
                  href={`/game/shared-${game.id}`}
                  aria-label={`عرض تفاصيل ${game.name}`}
                  className="absolute inset-0 z-10"
                />

                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl transition duration-300 group-hover:scale-105">
                  🎮
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#12101a] via-transparent to-black/20" />

                <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md">
                  مشترك
                </span>
              </div>

              <div className="p-4">
                <p className="text-[11px] font-bold text-violet-400">
                  {game.platform}
                </p>

                <Link
                  href={`/game/shared-${game.id}`}
                  className="mt-1 block text-lg font-black transition hover:text-violet-300"
                >
                  {game.name}
                </Link>

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

                  <button
                    type="button"
                    onClick={(event) => addToCart(game, "shared", event.currentTarget)}
                    className={`rounded-2xl bg-violet-600 px-5 py-3 text-xs font-black shadow-lg shadow-violet-900/30 transition duration-200 active:scale-95 ${
                      addingId === `shared-${game.id}`
                        ? "scale-90 brightness-125"
                        : "scale-100"
                    }`}
                  >
                    {addingId === `shared-${game.id}` ? "تمت الإضافة ✓" : "أضف للسلة"}
                  </button>
                </div>
              </div>
            </article>
          ))}
         </div>
        </div>
      </section>

      {/* الألعاب الخاصة */}
      <section id="private-games" className="scroll-mt-28 mx-auto max-w-7xl px-4 pt-12">
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

        <div className="scroll-clip">
          <div className="smooth-scroll flex snap-x gap-3 overflow-x-auto pb-5 md:grid md:grid-cols-3 md:overflow-visible">
            {privateGames.map((game) => (
              <article
                key={game.id}
                className="group min-w-[72%] snap-start overflow-hidden rounded-[26px] border border-fuchsia-500/15 bg-[#121019] transition duration-300 hover:-translate-y-1 hover:border-fuchsia-400/50 hover:shadow-2xl hover:shadow-fuchsia-950/30 sm:min-w-[290px] md:min-w-0"
              >
              <div data-game-image className="relative aspect-[4/5] overflow-hidden">
                <Link
                  href={`/game/private-${game.id}`}
                  aria-label={`عرض تفاصيل ${game.name}`}
                  className="absolute inset-0 z-10"
                />

                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-5xl transition duration-300 group-hover:scale-105">
                  🎮
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121019] via-transparent to-transparent" />

                <span className="pointer-events-none absolute right-2 top-2 z-20 rounded-lg bg-gradient-to-l from-fuchsia-600 to-violet-600 px-2 py-1 text-[9px] font-black">
                  خاص
                </span>
              </div>

              <div className="p-3">
                <p className="text-[10px] font-bold text-fuchsia-400">
                  {game.platform}
                </p>

                <Link
                  href={`/game/private-${game.id}`}
                  className="mt-1 block line-clamp-1 text-sm font-black transition hover:text-fuchsia-300"
                >
                  {game.name}
                </Link>

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

                  <button
                    type="button"
                    aria-label={`إضافة ${game.name} للسلة`}
                    onClick={(event) => addToCart(game, "private", event.currentTarget)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-600 text-lg font-black transition duration-200 active:scale-90 ${
                      addingId === `private-${game.id}`
                        ? "rotate-12 scale-90 brightness-125"
                        : "rotate-0 scale-100"
                    }`}
                  >
                    {addingId === `private-${game.id}` ? "✓" : "+"}
                  </button>
                </div>
              </div>
              </article>
            ))}
          </div>
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
      <footer id="contact" className="scroll-mt-28 relative mt-14 overflow-hidden border-t border-white/[0.06] bg-[#0b0911] pb-32 pt-10">
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
                <Link href="/about">من نحن</Link>
                <Link href="/faq">الأسئلة الشائعة</Link>
                <a href="#">تواصل معنا</a>
                <a href="#">تتبع الطلب</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-white">السياسات</h3>

              <div className="mt-4 flex flex-col gap-3 text-xs text-gray-500">
                <Link href="/terms">الشروط والأحكام</Link>
                <Link href="/privacy">سياسة الخصوصية</Link>
                <Link href="/returns">سياسة الإرجاع</Link>
                <Link href="/usage-policy">سياسة الاستخدام</Link>
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




      {/* قائمة الجوال الجانبية */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[220] transition duration-300 ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={closeMenu}
          className={`absolute inset-0 h-full w-full bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <aside
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل"
          onTouchStart={handleMenuTouchStart}
          onTouchEnd={handleMenuTouchEnd}
          className={`absolute bottom-0 left-0 top-0 flex w-[86%] max-w-[350px] flex-col overflow-hidden border-r border-white/10 bg-[#0c0913]/98 shadow-[20px_0_70px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="relative overflow-hidden border-b border-white/[0.07] px-5 pb-5 pt-6">
            <div className="absolute -left-10 -top-14 h-44 w-44 rounded-full bg-violet-600/20 blur-[65px]" />

            <div className="relative flex items-center justify-between">
              <button
                type="button"
                aria-label="إغلاق القائمة"
                onClick={closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl transition hover:bg-white/10 active:scale-90"
              >
                ×
              </button>

              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-wider">ZETA</h2>
                  <p className="mt-0.5 text-[10px] text-gray-500">قائمة المتجر</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
                  Z
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-3 md:px-4 md:py-5">
            <div className="flex flex-col gap-1 md:gap-2">
              <Link
                href="/favorites"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-500/10 text-xl transition group-hover:scale-110 md:h-10 md:w-10">
                  {favorites.length > 0 ? "♥" : "♡"}

                  {favorites.length > 0 && (
                    <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-black text-white">
                      {favorites.length}
                    </span>
                  )}
                </span>
                <span>المفضلة</span>
              </Link>

              <a
                href="#shared-games"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-violet-400/20 hover:bg-violet-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center md:h-10 md:w-10 rounded-2xl bg-violet-500/10 text-xl transition group-hover:scale-110">🎮</span>
                <span>ألعاب PC مشتركة</span>
              </a>

              <a
                href="#private-games"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-fuchsia-400/20 hover:bg-fuchsia-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center md:h-10 md:w-10 rounded-2xl bg-fuchsia-500/10 text-xl transition group-hover:scale-110">🔐</span>
                <span>ألعاب PC غير مشتركة</span>
              </a>

              <Link
                href="/best-sellers"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-orange-400/20 hover:bg-orange-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/10 text-xl transition group-hover:scale-110 md:h-10 md:w-10">
                  🔥
                </span>
                <span>الأكثر مبيعًا</span>
              </Link>

              <a
                href="#new-games"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-sky-400/20 hover:bg-sky-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center md:h-10 md:w-10 rounded-2xl bg-sky-500/10 text-xl transition group-hover:scale-110">✦</span>
                <span>جديدنا</span>
              </a>

              <a
                href="#contact"
                onClick={closeMenu}
                className="drawer-item group flex items-center gap-3 rounded-[20px] border border-transparent px-4 py-2.5 text-sm font-black md:py-3.5 text-gray-200 transition hover:border-emerald-400/20 hover:bg-emerald-500/10 hover:text-white active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center md:h-10 md:w-10 rounded-2xl bg-emerald-500/10 text-xl transition group-hover:scale-110">💬</span>
                <span>للتواصل</span>
              </a>
            </div>
          </nav>

          <div className="border-t border-white/[0.07] px-5 py-5">
            <p className="text-center text-[10px] text-gray-600">
              جميع الحقوق محفوظة © 2026 ZETA
            </p>
          </div>
        </aside>
      </div>

      {favoriteMessage && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[181] flex justify-center px-4">
          <div className="w-full max-w-[340px] animate-[cartToast_620ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="relative overflow-hidden rounded-[22px] border border-rose-300/20 bg-gradient-to-l from-[#24101b]/95 via-[#17101c]/95 to-[#24101b]/95 px-4 py-3.5 shadow-[0_18px_55px_rgba(136,19,55,0.35)] backdrop-blur-2xl">
              <div className="relative flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 text-xl font-black text-white">
                  ♥
                </div>

                <p className="min-w-0 truncate text-center text-sm font-black text-white">
                  {favoriteMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {cartMessage && (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[180] flex justify-center px-4">
          <div className="w-full max-w-[340px] animate-[cartToast_620ms_cubic-bezier(0.22,1,0.36,1)_both]">
            <div className="relative overflow-hidden rounded-[22px] border border-violet-300/20 bg-gradient-to-l from-[#1a1328]/95 via-[#15101f]/95 to-[#1a1328]/95 px-4 py-3.5 shadow-[0_18px_55px_rgba(76,29,149,0.45)] backdrop-blur-2xl">
              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-fuchsia-600/15 blur-3xl" />

              <div className="relative flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-900/25">
                  ✓
                </div>

                <div className="min-w-0 text-center">
                  <p className="text-[10px] font-bold text-violet-300">
                    تمت الإضافة بنجاح
                  </p>

                  <p className="mt-1 truncate text-sm font-black text-white">
                    {cartMessage.replace("تمت إضافة ", "").replace(" إلى السلة", "")}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-[3px] w-full overflow-hidden bg-white/5">
                <div className="h-full w-full origin-right animate-[toastProgress_2200ms_linear_forwards] bg-gradient-to-l from-violet-500 to-fuchsia-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

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

        .drawer-item {
          animation: drawerItemIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .drawer-item:nth-child(1) {
          animation-delay: 70ms;
        }

        .drawer-item:nth-child(2) {
          animation-delay: 105ms;
        }

        .drawer-item:nth-child(3) {
          animation-delay: 140ms;
        }

        .drawer-item:nth-child(4) {
          animation-delay: 175ms;
        }

        .drawer-item:nth-child(5) {
          animation-delay: 210ms;
        }

        .drawer-item:nth-child(6) {
          animation-delay: 245ms;
        }

        @keyframes cartBadgePop {
          0% {
            transform: scale(0.65);
          }

          70% {
            transform: scale(1.2);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes cartToast {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.9);
            filter: blur(8px);
          }

          55% {
            opacity: 1;
            transform: translateY(-4px) scale(1.03);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes toastProgress {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        @keyframes drawerItemIn {
          from {
            opacity: 0;
            transform: translateX(-18px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
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
          .splash-loading,
          .drawer-item {
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