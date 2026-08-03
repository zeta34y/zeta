"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  platform?: string;
  image?: string;
  quantity: number;
};

type AppliedCoupon = {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  appliesToAll: boolean;
  eligibleItemIds: string[];
};

type PaymentMethod = "creditcard" | "applepay";

type MoyasarPayment = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
};

type PreparedOrder = {
  id: string;
  orderNumber: string;
  total: number;
  totalHalalas: number;
};

type MoyasarOptions = {
  element: string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  supported_networks: string[];
  methods: PaymentMethod[];
  fixed_width: boolean;
  metadata?: Record<string, string>;
  apple_pay?: {
    country: string;
    label: string;
    validate_merchant_url: string;
  };
  on_completed?: (payment: MoyasarPayment) => Promise<void> | void;
  on_failure?: (error: unknown) => Promise<void> | void;
};

declare global {
  interface Window {
    Moyasar?: {
      init: (options: MoyasarOptions) => void;
    };
  }
}

const CART_KEY = "zeta_cart";
const COUPON_DETAILS_KEY = "zeta_coupon_details";
const PENDING_PAYMENT_KEY = "zeta_pending_payment";
const PENDING_ORDER_KEY = "zeta_pending_order";

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CheckoutPage() {
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("creditcard");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [moyasarLoaded, setMoyasarLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [preparedOrder, setPreparedOrder] = useState<PreparedOrder | null>(null);
  const [preparingOrder, setPreparingOrder] = useState(false);

  const publishableKey =
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY?.trim() ?? "";

  useEffect(() => {
    const stylesheetId = "moyasar-payment-form-css";

    if (!document.getElementById(stylesheetId)) {
      const stylesheet = document.createElement("link");
      stylesheet.id = stylesheetId;
      stylesheet.rel = "stylesheet";
      stylesheet.href =
        "https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.css";
      document.head.appendChild(stylesheet);
    }
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      if (Array.isArray(parsedCart)) {
        const safeCart = parsedCart
          .map((item): CartItem | null => {
            if (!item || typeof item !== "object") return null;

            const typedItem = item as Partial<CartItem>;
            const quantity = Math.max(1, Math.floor(toNumber(typedItem.quantity)));
            const price = Math.max(0, toNumber(typedItem.price));

            if (
              typedItem.id === undefined ||
              typeof typedItem.name !== "string" ||
              !typedItem.name.trim()
            ) {
              return null;
            }

            return {
              id: typedItem.id,
              name: typedItem.name,
              price,
              oldPrice:
                typedItem.oldPrice === undefined
                  ? undefined
                  : Math.max(0, toNumber(typedItem.oldPrice)),
              platform:
                typeof typedItem.platform === "string"
                  ? typedItem.platform
                  : "PC",
              image: typeof typedItem.image === "string" ? typedItem.image : "",
              quantity,
            };
          })
          .filter((item): item is CartItem => item !== null);

        setCart(safeCart);
      }

      const savedCouponDetails = localStorage.getItem(COUPON_DETAILS_KEY);

      if (savedCouponDetails) {
        const parsedCoupon = JSON.parse(savedCouponDetails) as AppliedCoupon;

        if (
          parsedCoupon &&
          typeof parsedCoupon.code === "string" &&
          Array.isArray(parsedCoupon.eligibleItemIds)
        ) {
          setCoupon(parsedCoupon);
        }
      }
    } catch (error) {
      console.error("تعذر تحميل بيانات الدفع:", error);
      setPaymentError("تعذر تحميل بيانات السلة. ارجع للسلة وحاول مرة أخرى.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("تعذر التحقق من تسجيل الدخول:", error);
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(Boolean(session));
      }

      setSessionChecked(true);
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * Math.max(1, item.quantity),
        0
      ),
    [cart]
  );

  const couponEligibleSubtotal = useMemo(() => {
    if (!coupon) return 0;

    const eligibleIds = new Set(coupon.eligibleItemIds.map(String));

    return cart.reduce((total, item) => {
      return eligibleIds.has(String(item.id))
        ? total + item.price * Math.max(1, item.quantity)
        : total;
    }, 0);
  }, [cart, coupon]);

  const couponDiscount = useMemo(() => {
    if (!coupon || couponEligibleSubtotal <= 0) return 0;

    const value =
      coupon.discountType === "percentage"
        ? couponEligibleSubtotal * (toNumber(coupon.discountValue) / 100)
        : Math.min(toNumber(coupon.discountValue), couponEligibleSubtotal);

    return Math.round(Math.max(0, value) * 100) / 100;
  }, [coupon, couponEligibleSubtotal]);

  const finalTotal =
    Math.round(Math.max(0, subtotal - couponDiscount) * 100) / 100;

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + Math.max(1, Number(item.quantity || 1)),
        0
      ),
    [cart]
  );

  useEffect(() => {
    if (
      !showPaymentForm ||
      !moyasarLoaded ||
      !window.Moyasar ||
      !publishableKey ||
      !preparedOrder ||
      preparedOrder.totalHalalas <= 0
    ) {
      return;
    }

    const formContainer = document.querySelector<HTMLElement>(".mysr-form");

    if (!formContainer) return;

    formContainer.innerHTML = "";
    setPaymentError("");

    const options: MoyasarOptions = {
      element: ".mysr-form",
      amount: preparedOrder.totalHalalas,
      currency: "SAR",
      description: `طلب ZETA ${preparedOrder.orderNumber} - ${totalItems} عنصر`,
      publishable_api_key: publishableKey,
      callback_url: `${window.location.origin}/payment/callback?order_id=${encodeURIComponent(
        preparedOrder.id
      )}`,
      supported_networks: ["mada", "visa", "mastercard"],
      methods: [selectedMethod],
      fixed_width: false,
      metadata: {
        store: "ZETA",
        order_id: preparedOrder.id,
        order_number: preparedOrder.orderNumber,
        items_count: String(totalItems),
        coupon_code: coupon?.code ?? "",
      },
      on_completed: async (payment) => {
        localStorage.setItem(
          PENDING_PAYMENT_KEY,
          JSON.stringify({
            id: payment.id ?? "",
            status: payment.status ?? "",
            amount: payment.amount ?? preparedOrder.totalHalalas,
            currency: payment.currency ?? "SAR",
            orderId: preparedOrder.id,
            orderNumber: preparedOrder.orderNumber,
            createdAt: new Date().toISOString(),
          })
        );
      },
      on_failure: async (error) => {
        console.error("فشل إنشاء عملية الدفع:", error);
        setPaymentError(
          typeof error === "string"
            ? error
            : "تعذر بدء عملية الدفع. تأكد من البيانات وحاول مرة أخرى."
        );
      },
    };

    if (selectedMethod === "applepay") {
      options.apple_pay = {
        country: "SA",
        label: "ZETA",
        validate_merchant_url:
          "https://api.moyasar.com/v1/applepay/initiate",
      };
    }

    window.Moyasar.init(options);
  }, [
    coupon?.code,
    moyasarLoaded,
    preparedOrder,
    publishableKey,
    selectedMethod,
    showPaymentForm,
    totalItems,
  ]);

  function openLogin() {
    window.dispatchEvent(new CustomEvent("zeta-open-login"));
    window.location.href = "/cart";
  }

  async function continueToPayment() {
    if (preparingOrder) return;

    setPaymentError("");

    if (!isLoggedIn) {
      openLogin();
      return;
    }

    if (!publishableKey) {
      setPaymentError(
        "مفتاح ميسر غير موجود. أضف NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY داخل .env.local ثم أعد تشغيل المشروع."
      );
      return;
    }

    if (cart.length === 0 || finalTotal <= 0) {
      setPaymentError("السلة فارغة أو إجمالي الطلب غير صالح.");
      return;
    }

    setPreparingOrder(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error("انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى.");
      }

      let checkoutToken = localStorage.getItem(PENDING_ORDER_KEY) || "";

      if (!checkoutToken) {
        checkoutToken = crypto.randomUUID();
        localStorage.setItem(PENDING_ORDER_KEY, checkoutToken);
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          couponCode: coupon?.code ?? "",
          paymentMethod: selectedMethod,
          checkoutToken,
        }),
      });

      const result = (await response.json()) as {
        orderId?: string;
        orderNumber?: string;
        total?: number;
        totalHalalas?: number;
        error?: string;
      };

      if (!response.ok || !result.orderId || !result.orderNumber) {
        throw new Error(result.error || "تعذر تجهيز الطلب للدفع.");
      }

      setPreparedOrder({
        id: result.orderId,
        orderNumber: result.orderNumber,
        total: Number(result.total || 0),
        totalHalalas: Number(result.totalHalalas || 0),
      });
      setShowPaymentForm(true);

      window.setTimeout(() => {
        formSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "تعذر تجهيز الطلب للدفع."
      );
    } finally {
      setPreparingOrder(false);
    }
  }

  function changeMethod(method: PaymentMethod) {
    setSelectedMethod(method);
    setShowPaymentForm(false);
    setPaymentError("");
  }

  if (!loaded || !sessionChecked) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-sm font-bold text-gray-400">
            جاري تجهيز صفحة الدفع...
          </p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 text-white"
      >
        <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-500/15 text-3xl">
            🛒
          </div>
          <h1 className="mt-5 text-xl font-black">السلة فارغة</h1>
          <p className="mt-2 text-sm leading-7 text-gray-400">
            أضف لعبة إلى السلة ثم ارجع لإتمام الطلب.
          </p>
          <Link
            href="/"
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 text-sm font-black"
          >
            تصفح الألعاب
          </Link>
        </section>
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => setMoyasarLoaded(true)}
        onError={() =>
          setPaymentError(
            "تعذر تحميل بوابة الدفع. تأكد من اتصال الإنترنت وحاول مرة أخرى."
          )
        }
      />

      <main
        dir="rtl"
        className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-[calc(32px+env(safe-area-inset-bottom))] text-white"
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -right-40 top-0 h-[430px] w-[430px] rounded-full bg-fuchsia-700/15 blur-[130px]" />
          <div className="absolute -left-40 top-[460px] h-[430px] w-[430px] rounded-full bg-violet-700/15 blur-[130px]" />
        </div>

        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
          <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between px-4">
            <Link
              href="/cart"
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-gray-200 active:scale-[0.98]"
            >
              <span>→</span>
              <span>السلة</span>
            </Link>

            <div className="text-center">
              <h1 className="text-base font-black">الدفع الآمن</h1>
              <p className="mt-0.5 text-[10px] text-gray-500">ZETA</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-lg font-black shadow-lg shadow-violet-900/30">
              Z
            </div>
          </div>
        </header>

        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <section className="min-w-0 space-y-5">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[10px] font-black text-violet-200">
                    الخطوة الأخيرة
                  </span>
                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    اختر طريقة الدفع
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-gray-400 sm:text-sm">
                    اختر Apple Pay أو البطاقة البنكية، ثم أكمل الدفع من النموذج الآمن.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-3 py-2 text-[10px] font-black text-emerald-300 sm:block">
                  🔒 اتصال آمن
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => changeMethod("applepay")}
                  className={`min-h-[92px] rounded-[22px] border p-3 text-right transition active:scale-[0.98] ${
                    selectedMethod === "applepay"
                      ? "border-white/30 bg-white text-black shadow-xl"
                      : "border-white/10 bg-black/20 text-white hover:border-white/20"
                  }`}
                >
                  <span className="block text-lg font-black"> Pay</span>
                  <span
                    className={`mt-2 block text-[10px] leading-5 ${
                      selectedMethod === "applepay"
                        ? "text-gray-600"
                        : "text-gray-500"
                    }`}
                  >
                    أسرع دفع على أجهزة Apple المدعومة
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => changeMethod("creditcard")}
                  className={`min-h-[92px] rounded-[22px] border p-3 text-right transition active:scale-[0.98] ${
                    selectedMethod === "creditcard"
                      ? "border-violet-400/40 bg-violet-500/15 shadow-xl shadow-violet-950/30"
                      : "border-white/10 bg-black/20 hover:border-white/20"
                  }`}
                >
                  <span className="block text-sm font-black">بطاقة بنكية</span>
                  <span className="mt-2 block text-[10px] leading-5 text-gray-400">
                    مدى · Visa · Mastercard
                  </span>
                </button>
              </div>

              {selectedMethod === "applepay" && (
                <p className="mt-3 rounded-2xl border border-amber-400/15 bg-amber-500/10 px-3 py-2.5 text-[10px] leading-5 text-amber-200">
                  Apple Pay يظهر عند فتح الموقع من جهاز ومتصفح يدعمانه وبعد تسجيل الدومين في بوابة الدفع.
                </p>
              )}

              {!showPaymentForm ? (
                <button
                  type="button"
                  onClick={() => void continueToPayment()}
                  disabled={preparingOrder}
                  className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 text-sm font-black shadow-xl shadow-violet-900/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {preparingOrder ? "جاري إنشاء طلبك..." : "المتابعة بالدفع عبر"}{" "}
                    {selectedMethod === "applepay"
                      ? "Apple Pay"
                      : "البطاقة البنكية"}
                  </span>
                  <span>←</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="mt-5 min-h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-xs font-black text-gray-300 active:scale-[0.98]"
                >
                  تغيير طريقة الدفع
                </button>
              )}

              {paymentError && (
                <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold leading-6 text-red-200">
                  {paymentError}
                </div>
              )}
            </div>

            {showPaymentForm && (
              <div
                ref={formSectionRef}
                className="scroll-mt-24 rounded-[26px] border border-white/10 bg-white p-4 text-black shadow-2xl sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-gray-950">بيانات الدفع</h3>
                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      لا تحفظ ZETA بيانات بطاقتك داخل الموقع.
                    </p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-700">
                    {selectedMethod === "applepay"
                      ? "Apple Pay"
                      : "مدى / Visa / Mastercard"}
                  </span>
                </div>

                {!moyasarLoaded && (
                  <div className="flex min-h-40 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />
                      <p className="mt-3 text-xs font-bold text-gray-500">
                        جاري تحميل نموذج الدفع...
                      </p>
                    </div>
                  </div>
                )}

                <div className="mysr-form w-full" />
              </div>
            )}
          </section>

          <aside className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4 shadow-2xl sm:p-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black">ملخص الطلب</h2>
                <p className="mt-1 text-[10px] text-gray-500">
                  {totalItems} عنصر في السلة
                </p>
              </div>

              <Link
                href="/cart"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-black text-gray-300"
              >
                تعديل
              </Link>
            </div>

            <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pl-1">
              {cart.map((item) => (
                <div
                  key={String(item.id)}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-black/20 p-3"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/[0.05]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🎮</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black">{item.name}</p>
                    <p className="mt-1 truncate text-[10px] text-gray-500">
                      {item.platform || "PC"} · الكمية {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-black">
                    {money(item.price * item.quantity)}
                    <span className="mr-1 text-[9px] text-gray-500">ر.س</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>المجموع</span>
                <span>{money(subtotal)} ر.س</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-300">
                  <span>خصم الكود {coupon?.code ? `(${coupon.code})` : ""}</span>
                  <span>- {money(couponDiscount)} ر.س</span>
                </div>
              )}

              <div className="flex items-end justify-between border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-gray-500">الإجمالي النهائي</p>
                  <p className="mt-1 text-2xl font-black">
                    {money(preparedOrder?.total ?? finalTotal)}
                    <span className="mr-1 text-xs text-gray-400">ر.س</span>
                  </p>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
                  شامل الخصم
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
              <div className="flex gap-2 text-[10px] leading-5 text-gray-400">
                <span className="mt-0.5">🛡️</span>
                <p>
                  لن يُعتمد الطلب نهائيًا إلا بعد التحقق من حالة العملية والمبلغ من الخادم.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <style jsx global>{`
          .mysr-form {
            width: 100% !important;
            max-width: none !important;
          }

          .mysr-form input,
          .mysr-form select,
          .mysr-form button {
            min-height: 48px;
            font-size: 16px !important;
          }

          @media (max-width: 640px) {
            .mysr-form {
              padding: 0 !important;
            }
          }
        `}</style>
      </main>
    </>
  );
}