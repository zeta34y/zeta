"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import LoginSheet from "@/components/LoginSheet";
import { supabase } from "@/lib/supabase";

type CartItem = {
  quantity?: number;
};

const CART_KEY = "zeta_cart";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const userName = useMemo(() => {
    if (!user) return "";

    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      user.phone ||
      "مستخدم"
    );
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return "";

    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      ""
    );
  }, [user]);

  function readCartCount() {
    try {
      const savedCart = localStorage.getItem(CART_KEY);
      const parsedCart: CartItem[] = savedCart
        ? JSON.parse(savedCart)
        : [];

      const count = Array.isArray(parsedCart)
        ? parsedCart.reduce(
            (total, item) =>
              total + Number(item.quantity || 1),
            0
          )
        : 0;

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  }

  function openLoginSheet() {
    setLoginOpen(true);
  }

  function closeLoginSheet() {
    setLoginOpen(false);
  }

  function openAccount() {
    if (!user) {
      openLoginSheet();
      return;
    }

    router.push("/account");
  }

  function openSearch() {
    if (pathname === "/") {
      window.history.replaceState(null, "", "/#search");

      window.dispatchEvent(
        new CustomEvent("zeta-open-search")
      );

      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("zeta-open-search")
        );
      }, 120);

      return;
    }

    router.push("/#search");

    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("zeta-open-search")
      );
    }, 450);
  }

  useEffect(() => {
    readCartCount();

    async function loadCurrentUser() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoaded(true);
      }
    }

    loadCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoaded(true);

        if (session?.user) {
          setLoginOpen(false);
        }
      }
    );

    function handleCartUpdate() {
      readCartCount();
    }

    function handleOpenLogin() {
      if (user) {
        router.push("/account");
        return;
      }

      openLoginSheet();
    }

    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener(
      "zeta-cart-updated",
      handleCartUpdate
    );
    window.addEventListener(
      "zeta-open-login",
      handleOpenLogin
    );

    return () => {
      subscription.unsubscribe();

      window.removeEventListener(
        "storage",
        handleCartUpdate
      );
      window.removeEventListener(
        "zeta-cart-updated",
        handleCartUpdate
      );
      window.removeEventListener(
        "zeta-open-login",
        handleOpenLogin
      );
    };
  }, [router, user]);

  const baseClass =
    "group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[20px] text-white/85 transition duration-200 hover:-translate-y-2 hover:bg-white/15 hover:text-white hover:shadow-[0_14px_28px_rgba(139,92,246,0.55)] active:-translate-y-1 active:scale-95";

  const activeClass =
    "bg-white/15 text-white shadow-lg shadow-black/10";

  const accountActive =
    pathname.startsWith("/account") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/notifications");

  return (
    <>
      <nav
        dir="rtl"
        aria-label="التنقل السفلي"
        className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-[100] mx-auto max-w-md rounded-[28px] border border-violet-300/20 bg-gradient-to-l from-violet-700/95 via-fuchsia-600/95 to-violet-700/95 p-2 shadow-[0_18px_50px_rgba(76,29,149,0.48)] backdrop-blur-xl"
      >
        <div className="grid grid-cols-5 gap-1">
          <Link
            href="/"
            aria-label="الرئيسية"
            className={`${baseClass} ${
              pathname === "/" ? activeClass : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[24px] w-[24px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 10.7 12 3.8l8.5 6.9"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.5 9.7v9.2h13V9.7M9.2 18.9v-5.4h5.6v5.4"
              />
            </svg>

            <span className="text-[9px] font-black">
              الرئيسية
            </span>
          </Link>

          <Link
            href="/categories"
            aria-label="التصنيفات"
            className={`${baseClass} ${
              pathname.startsWith("/categories")
                ? activeClass
                : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <rect
                x="3.5"
                y="3.5"
                width="6.5"
                height="6.5"
                rx="2"
              />
              <rect
                x="14"
                y="3.5"
                width="6.5"
                height="6.5"
                rx="2"
              />
              <rect
                x="3.5"
                y="14"
                width="6.5"
                height="6.5"
                rx="2"
              />
              <rect
                x="14"
                y="14"
                width="6.5"
                height="6.5"
                rx="2"
              />
            </svg>

            <span className="text-[9px] font-black">
              التصنيفات
            </span>
          </Link>

          <Link
            href="/cart"
            aria-label="السلة"
            className={`${baseClass} relative ${
              pathname === "/cart" ? activeClass : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 4.5h2l1.8 10.1a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 1.9-1.4l1.4-5.3H7"
              />
              <circle cx="9.5" cy="19.2" r="1.2" />
              <circle cx="17.2" cy="19.2" r="1.2" />
            </svg>

            <span
              key={cartCount}
              className="absolute right-[24%] top-1 flex h-4 min-w-4 animate-[cartBadgePop_260ms_ease-out] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black text-white"
            >
              {cartCount}
            </span>

            <span className="text-[9px] font-black">
              السلة
            </span>
          </Link>

          <button
            type="button"
            onClick={openAccount}
            aria-label={user ? `حساب ${userName}` : "تسجيل الدخول"}
            className={`${baseClass} ${
              (user && accountActive) || loginOpen
                ? activeClass
                : ""
            }`}
          >
            {authLoaded && user && avatarUrl ? (
              <span className="relative flex h-[27px] w-[27px] items-center justify-center overflow-hidden rounded-full border border-white/30 shadow-md">
                <img
                  src={avatarUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
              </span>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
              >
                <circle cx="12" cy="7.2" r="3.2" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.8 20c.5-4 2.8-6.2 6.2-6.2s5.7 2.2 6.2 6.2"
                />
              </svg>
            )}

            <span className="max-w-[60px] truncate text-[9px] font-black">
              {authLoaded && user ? "حسابي" : "الدخول"}
            </span>
          </button>

          <button
            type="button"
            onClick={openSearch}
            aria-label="البحث"
            className={baseClass}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[25px] w-[25px] fill-none stroke-current stroke-[1.9] transition duration-200 group-hover:scale-110"
            >
              <circle cx="10.8" cy="10.8" r="5.8" />
              <path
                strokeLinecap="round"
                d="m15.2 15.2 4.3 4.3"
              />
            </svg>

            <span className="text-[9px] font-black">
              بحث
            </span>
          </button>
        </div>
      </nav>

      {!user && (
        <LoginSheet
          open={loginOpen}
          onClose={closeLoginSheet}
        />
      )}

      <style jsx global>{`
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
      `}</style>
    </>
  );
}