"use client";

import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  platform?: string;
  image?: string;
  quantity: number;
};

const CART_KEY = "zeta_cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }

      const savedCoupon = localStorage.getItem("zeta_coupon");

      if (savedCoupon === "ZETA10") {
        setCouponCode("ZETA10");
        setAppliedCoupon("ZETA10");
      }
    } catch (error) {
      console.error("حدث خطأ أثناء قراءة السلة:", error);
      localStorage.removeItem(CART_KEY);
    } finally {
      setLoaded(true);
    }
  }, []);

  function saveCart(updatedCart: CartItem[]) {
    setCart(updatedCart);
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));

    window.dispatchEvent(
      new CustomEvent("zeta-cart-updated", {
        detail: updatedCart,
      })
    );
  }

  function increaseQuantity(id: string | number) {
    saveCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function decreaseQuantity(id: string | number) {
    const selectedItem = cart.find((item) => item.id === id);

    if (!selectedItem) return;

    if (selectedItem.quantity <= 1) {
      removeItem(id);
      return;
    }

    saveCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  }

  function removeItem(id: string | number) {
    setRemovingId(id);

    window.setTimeout(() => {
      saveCart(cart.filter((item) => item.id !== id));
      setRemovingId(null);
    }, 280);
  }

  function clearCart() {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف جميع الألعاب من السلة؟"
    );

    if (!confirmed) return;

    saveCart([]);
  }

  function applyCoupon() {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponMessage("اكتب كود الخصم أولًا");
      return;
    }

    if (normalizedCode !== "ZETA10") {
      setAppliedCoupon("");
      localStorage.removeItem("zeta_coupon");
      setCouponMessage("كود الخصم غير صحيح");
      return;
    }

    setCouponCode("ZETA10");
    setAppliedCoupon("ZETA10");
    localStorage.setItem("zeta_coupon", "ZETA10");
    setCouponMessage("تم تطبيق خصم 10% بنجاح");
  }

  function removeCoupon() {
    setCouponCode("");
    setAppliedCoupon("");
    setCouponMessage("");
    localStorage.removeItem("zeta_coupon");
  }

  const totalItems = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const oldTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + (item.oldPrice ?? item.price) * item.quantity,
        0
      ),
    [cart]
  );

  const discount = Math.max(oldTotal - subtotal, 0);

  const couponDiscount =
    appliedCoupon === "ZETA10"
      ? Math.round(subtotal * 0.1 * 100) / 100
      : 0;

  const finalTotal =
    Math.round(Math.max(subtotal - couponDiscount, 0) * 100) / 100;

  const totalSavings =
    Math.round((discount + couponDiscount) * 100) / 100;

  if (!loaded) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm font-bold text-gray-400">
            جاري تحميل السلة...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white [overscroll-behavior-y:contain]"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-900/30">
              Z

              {totalItems > 0 && (
                <span className="absolute -left-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#08070d] bg-red-500 px-1 text-[10px] font-black text-white">
                  {totalItems}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">ZETA</h1>
              <p className="text-[10px] text-gray-500">سلة المشتريات</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span>العودة للرئيسية</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-none stroke-current stroke-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15 6-6 6 6 6"
              />
            </svg>
          </Link>
        </div>
      </header>

      {cart.length === 0 ? (
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-190px)] max-w-5xl items-center justify-center px-4 py-10">
          <div className="w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[34px] border border-violet-400/15 bg-gradient-to-br from-[#171322] via-[#100d18] to-[#0c0a11] px-5 py-9 text-center shadow-[0_30px_90px_rgba(76,29,149,0.2)] sm:px-9 sm:py-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-[90px]" />

              <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
                <div className="absolute inset-4 animate-[cartGlow_2800ms_ease-in-out_infinite] rounded-full bg-violet-600/10 blur-2xl" />
                <div className="absolute inset-3 animate-[slowSpin_18s_linear_infinite] rounded-full border border-dashed border-violet-400/20" />

                <div className="absolute left-4 top-12 animate-[floatingItem_2600ms_ease-in-out_infinite] rounded-2xl border border-violet-400/20 bg-violet-500/10 p-2.5 text-2xl">
                  🎮
                </div>

                <div className="absolute right-4 top-16 animate-[floatingItem_3000ms_ease-in-out_infinite_400ms] rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-2.5 text-xl">
                  ✦
                </div>

                <div className="absolute bottom-7 left-10 animate-[floatingItem_2800ms_ease-in-out_infinite_700ms] rounded-2xl border border-sky-400/20 bg-sky-500/10 p-2 text-xl">
                  🕹️
                </div>

                <div className="relative flex h-28 w-28 animate-[cartFloat_2400ms_ease-in-out_infinite] items-center justify-center rounded-[34px] border border-white/10 bg-gradient-to-br from-violet-600/25 to-fuchsia-600/15 shadow-[0_20px_50px_rgba(124,58,237,0.25)] backdrop-blur-xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-14 w-14 fill-none stroke-violet-200 stroke-[1.5]"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.5 4.5h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4l1.4-5.3H7"
                    />
                    <circle cx="9.5" cy="19.2" r="1.2" />
                    <circle cx="17.2" cy="19.2" r="1.2" />
                  </svg>

                  <span className="absolute -left-1 -top-1 flex h-7 min-w-7 animate-pulse items-center justify-center rounded-full border-2 border-[#171322] bg-gradient-to-br from-violet-500 to-fuchsia-600 px-1 text-xs font-black">
                    0
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-bold text-violet-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                  سلة المشتريات
                </span>

                <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                  سلتك فارغة حاليًا
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-gray-400">
                  لم تضف أي لعبة إلى السلة حتى الآن. تصفح الألعاب واختر اللعبة
                  المناسبة لك.
                </p>

                <Link
                  href="/#new-games"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-7 py-4 text-sm font-black shadow-xl shadow-violet-900/30 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] sm:w-auto"
                >
                  <span>استكشف الألعاب</span>
                  <span className="text-lg">🎮</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative z-10 mx-auto max-w-6xl px-4 py-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold text-violet-400">مشترياتك</p>
              <h2 className="mt-1 text-2xl font-black">سلة المشتريات</h2>
              <p className="mt-2 text-xs text-gray-500">
                لديك {totalItems} منتج في السلة
              </p>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 active:scale-95"
            >
              تفريغ السلة
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111019] p-4 shadow-xl transition-all duration-300 ${
                    removingId === item.id
                      ? "-translate-x-12 scale-95 opacity-0"
                      : "translate-x-0 scale-100 opacity-100"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[20px] border border-violet-400/10 bg-gradient-to-br from-violet-700/20 to-fuchsia-700/20 text-4xl sm:h-32 sm:w-28">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>🎮</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-violet-400">
                            {item.platform || "PC"}
                          </p>
                          <h3 className="mt-1 truncate text-sm font-black sm:text-base">
                            {item.name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label="حذف المنتج"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-400/10 bg-red-500/10 text-sm text-red-300 transition hover:bg-red-500/20 active:scale-90"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-white">
                            {item.price * item.quantity}
                            <span className="mr-1 text-[10px] text-gray-500">
                              ر.س
                            </span>
                          </p>

                          {item.oldPrice && item.oldPrice > item.price && (
                            <p className="mt-1 text-[10px] text-gray-600 line-through">
                              {item.oldPrice * item.quantity} ر.س
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/20 p-1.5">
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-lg font-black transition hover:bg-violet-500 active:scale-90"
                          >
                            +
                          </button>

                          <span className="min-w-8 text-center text-sm font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-black transition hover:bg-white/10 active:scale-90"
                          >
                            −
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              <Link
                href="/#new-games"
                className="flex items-center justify-center gap-2 rounded-[22px] border border-dashed border-violet-400/20 bg-violet-500/[0.04] px-5 py-5 text-sm font-bold text-violet-300 transition hover:border-violet-400/40 hover:bg-violet-500/10 active:scale-[0.99]"
              >
                <span className="text-lg">＋</span>
                <span>إضافة ألعاب أخرى</span>
              </Link>
            </div>

            <aside className="h-fit rounded-[28px] border border-violet-400/15 bg-gradient-to-br from-[#171322] to-[#0e0c14] p-5 shadow-2xl shadow-violet-950/20 lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-xl">
                  🧾
                </div>

                <div>
                  <p className="text-xs font-bold text-violet-400">ملخص الطلب</p>
                  <h3 className="text-lg font-black">تفاصيل المبلغ</h3>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">عدد المنتجات</span>
                  <span className="font-bold">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">مجموع المنتجات</span>
                  <span className="font-bold">{oldTotal} ر.س</span>
                </div>

                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">الخصم</span>
                    <span className="font-bold text-emerald-400">
                      -{discount} ر.س
                    </span>
                  </div>
                )}

                <div className="pt-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-gray-500">كود الخصم</span>

                    {appliedCoupon === "ZETA10" && (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-[10px] font-bold text-red-300 transition hover:text-red-200"
                      >
                        إزالة الكود
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => {
                        setCouponCode(
                          event.target.value
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .toUpperCase()
                        );
                        setCouponMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          applyCoupon();
                        }
                      }}
                      placeholder="أدخل كود الخصم"
                      maxLength={20}
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-left text-xs font-black uppercase tracking-wider text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                      dir="ltr"
                    />

                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="shrink-0 rounded-xl bg-violet-600 px-4 py-3 text-xs font-black transition hover:bg-violet-500 active:scale-95"
                    >
                      تطبيق
                    </button>
                  </div>

                  {couponMessage && (
                    <p
                      className={`mt-2 text-[10px] font-bold ${
                        appliedCoupon === "ZETA10"
                          ? "text-emerald-400"
                          : "text-red-300"
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06] px-3 py-2.5">
                    <span className="text-xs text-emerald-300">
                      خصم كود ZETA10
                    </span>

                    <span className="font-black text-emerald-400">
                      -{couponDiscount} ر.س
                    </span>
                  </div>
                )}
              </div>

              <div className="my-5 h-px bg-white/[0.08]" />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">المبلغ الإجمالي</p>
                  <p className="mt-1 text-2xl font-black">
                    {finalTotal}
                    <span className="mr-1 text-xs text-gray-400">ر.س</span>
                  </p>
                </div>

                {totalSavings > 0 && (
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300">
                    وفرت {totalSavings} ر.س
                  </span>
                )}
              </div>

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black shadow-xl shadow-violet-900/30 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              >
                <span>إتمام الطلب</span>
                <span>←</span>
              </button>
            </aside>
          </div>
        </section>
      )}

      <BottomNav />

      <style jsx global>{`
        @keyframes cartFloat {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }

          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }

        @keyframes floatingItem {
          0%,
          100% {
            transform: translateY(0) rotate(-5deg);
          }

          50% {
            transform: translateY(-12px) rotate(5deg);
          }
        }

        @keyframes slowSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes cartGlow {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.9);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}