"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const PASSWORD_CHANGE_DAYS = 7;
const PASSWORD_CHANGE_MS =
  PASSWORD_CHANGE_DAYS * 24 * 60 * 60 * 1000;

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const avatarUrl = useMemo(() => {
    if (!user) return "";

    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      ""
    );
  }, [user]);

  const isAdmin =
    user?.app_metadata?.role === "admin" ||
    user?.app_metadata?.user_role === "admin";

  const passwordChangedAt = useMemo(() => {
    const value = user?.user_metadata?.password_changed_at;

    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [user]);

  const passwordChangeStatus = useMemo(() => {
    if (!passwordChangedAt) {
      return {
        allowed: true,
        daysLeft: 0,
      };
    }

    const availableAt = new Date(
      passwordChangedAt.getTime() + PASSWORD_CHANGE_MS
    );

    const remaining = availableAt.getTime() - Date.now();

    if (remaining <= 0) {
      return {
        allowed: true,
        daysLeft: 0,
      };
    }

    return {
      allowed: false,
      daysLeft: Math.ceil(
        remaining / (24 * 60 * 60 * 1000)
      ),
    };
  }, [passwordChangedAt]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!currentUser) {
          router.replace("/");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);
        setName(
          currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            ""
        );
        setEmail(currentUser.email || "");
        setPhone(currentUser.phone || "");
      } catch (error) {
        console.error("تعذر تحميل الحساب:", error);

        if (mounted) {
          setErrorMessage("تعذر تحميل بيانات الحساب");
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) {
          router.replace("/");
          return;
        }

        setUser(session.user);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function clearMessages() {
    setMessage("");
    setErrorMessage("");
  }

  function cleanEmail(value: string) {
    return value
      .replace(
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
        ""
      )
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9@._+-]/g, "")
      .toLowerCase();
  }

  function cleanPhone(value: string) {
    return value.replace(/[^\d+]/g, "").slice(0, 16);
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      value.trim()
    );
  }

  function validatePhone(value: string) {
    if (!value) return true;
    return /^\+\d{8,15}$/.test(value);
  }

  async function saveProfile() {
    if (!user || savingProfile) return;

    clearMessages();

    const cleanedName = name.trim();
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPhone = phone.trim();

    if (!cleanedName) {
      setErrorMessage("اكتب اسم المستخدم");
      return;
    }

    if (cleanedEmail && !validateEmail(cleanedEmail)) {
      setErrorMessage("اكتب بريدًا إلكترونيًا صحيحًا");
      return;
    }

    if (!validatePhone(cleanedPhone)) {
      setErrorMessage(
        "اكتب رقم الجوال بصيغة دولية مثل +9665XXXXXXXX"
      );
      return;
    }

    setSavingProfile(true);

    try {
      const updates: {
        data: {
          full_name: string;
          name: string;
        };
        email?: string;
        phone?: string;
      } = {
        data: {
          full_name: cleanedName,
          name: cleanedName,
        },
      };

      if (cleanedEmail && cleanedEmail !== user.email) {
        updates.email = cleanedEmail;
      }

      if (cleanedPhone && cleanedPhone !== user.phone) {
        updates.phone = cleanedPhone;
      }

      const { data, error } =
        await supabase.auth.updateUser(updates);

      if (error) throw error;

      setUser(data.user);
      setMessage(
        updates.email || updates.phone
          ? "تم الحفظ، وقد تحتاج إلى تأكيد البريد أو الجوال الجديد."
          : "تم حفظ بيانات الحساب."
      );

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated", {
          detail: data.user,
        })
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ بيانات الحساب"
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!user || changingPassword) return;

    clearMessages();

    if (!passwordChangeStatus.allowed) {
      setErrorMessage(
        `يمكنك تغيير كلمة المرور بعد ${passwordChangeStatus.daysLeft} ${
          passwordChangeStatus.daysLeft === 1 ? "يوم" : "أيام"
        }`
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
      );
      return;
    }

    if (/\s/.test(newPassword)) {
      setErrorMessage(
        "كلمة المرور لا يجب أن تحتوي على مسافات"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين");
      return;
    }

    setChangingPassword(true);

    try {
      const changedAt = new Date().toISOString();

      const { data, error } =
        await supabase.auth.updateUser({
          password: newPassword,
          data: {
            ...user.user_metadata,
            password_changed_at: changedAt,
          },
        });

      if (error) throw error;

      setUser(data.user);
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        "تم تغيير كلمة المرور، ويمكن تغييرها مرة أخرى بعد 7 أيام."
      );

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated", {
          detail: data.user,
        })
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تغيير كلمة المرور"
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    clearMessages();
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated")
      );

      router.replace("/");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تسجيل الخروج"
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (loadingUser) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-xs text-gray-400">
            جاري تحميل الحساب...
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const displayName =
    name ||
    user.email?.split("@")[0] ||
    user.phone ||
    "مستخدم ZETA";

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-28 top-0 h-[340px] w-[340px] rounded-full bg-violet-700/14 blur-[115px]" />
        <div className="absolute -left-28 top-[430px] h-[320px] w-[320px] rounded-full bg-fuchsia-700/10 blur-[115px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-[9px] font-bold text-violet-400">
              إعدادات الحساب
            </p>
            <h1 className="mt-0.5 text-lg font-black">
              حسابي
            </h1>
          </div>

          <Link
            href="/"
            aria-label="إغلاق صفحة الحساب"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-gray-200 transition active:scale-95"
          >
            ×
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="rounded-[26px] border border-violet-400/15 bg-gradient-to-br from-violet-700/20 via-[#14101d] to-fuchsia-700/10 p-4 shadow-2xl sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-black shadow-xl shadow-violet-950/30 sm:h-20 sm:w-20 sm:rounded-[26px] sm:text-3xl">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-black sm:text-xl">
                  {displayName}
                </h2>

                {isAdmin && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[8px] font-black text-amber-300">
                    إداري
                  </span>
                )}
              </div>

              <p
                dir="ltr"
                className="mt-1.5 truncate text-left text-[10px] text-gray-500 sm:text-xs"
              >
                {user.email || user.phone || "حساب ZETA"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4 transition active:scale-[0.98]"
          >
            <span className="text-2xl">📦</span>
            <h3 className="mt-3 text-sm font-black">الطلبات</h3>
            <p className="mt-1 text-[9px] text-gray-500">
              متابعة مشترياتك
            </p>
          </Link>

          <Link
            href="/notifications"
            className="rounded-[22px] border border-white/[0.07] bg-white/[0.035] p-4 transition active:scale-[0.98]"
          >
            <span className="text-2xl">🔔</span>
            <h3 className="mt-3 text-sm font-black">الإشعارات</h3>
            <p className="mt-1 text-[9px] text-gray-500">
              آخر التحديثات
            </p>
          </Link>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="mt-3 flex items-center justify-between rounded-[22px] border border-amber-400/20 bg-amber-500/10 p-4 transition active:scale-[0.99]"
          >
            <div>
              <p className="text-[9px] font-bold text-amber-400">
                صلاحية إدارية
              </p>
              <h3 className="mt-1 text-sm font-black">
                إدارة المتجر
              </h3>
            </div>

            <span className="text-2xl">⚙️</span>
          </Link>
        )}

        <section className="mt-4 rounded-[26px] border border-white/[0.07] bg-[#121019] p-4 sm:p-5">
          <div>
            <p className="text-[9px] font-bold text-violet-400">
              البيانات الشخصية
            </p>
            <h2 className="mt-1 text-base font-black">
              معلومات الحساب
            </h2>
          </div>

          <label className="mt-4 block">
            <span className="text-[11px] font-black text-gray-300">
              اسم المستخدم
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              autoComplete="name"
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-400/50"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-[11px] font-black text-gray-300">
              البريد الإلكتروني
            </span>
            <input
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) =>
                setEmail(cleanEmail(event.target.value))
              }
              maxLength={120}
              autoComplete="email"
              placeholder="name@example.com"
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-400/50"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-[11px] font-black text-gray-300">
              رقم الجوال
            </span>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(event) =>
                setPhone(cleanPhone(event.target.value))
              }
              autoComplete="tel"
              placeholder="+9665XXXXXXXX"
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm tracking-wide text-white outline-none placeholder:text-gray-600 focus:border-violet-400/50"
            />
          </label>

          <button
            type="button"
            onClick={saveProfile}
            disabled={savingProfile}
            className="mt-4 flex w-full items-center justify-center rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-black shadow-xl shadow-violet-950/30 transition active:scale-[0.98] disabled:opacity-60"
          >
            {savingProfile ? "جاري الحفظ..." : "حفظ البيانات"}
          </button>
        </section>

        <section className="mt-4 rounded-[26px] border border-white/[0.07] bg-[#121019] p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold text-fuchsia-400">
                حماية الحساب
              </p>
              <h2 className="mt-1 text-base font-black">
                تغيير كلمة المرور
              </h2>
            </div>

            <span className="text-2xl">🔒</span>
          </div>

          {!passwordChangeStatus.allowed && (
            <div className="mt-3 rounded-[18px] border border-amber-400/15 bg-amber-500/10 px-3.5 py-3 text-[11px] font-bold leading-5 text-amber-300">
              يمكنك تغيير كلمة المرور بعد{" "}
              {passwordChangeStatus.daysLeft}{" "}
              {passwordChangeStatus.daysLeft === 1
                ? "يوم"
                : "أيام"}
            </div>
          )}

          <label className="mt-4 block">
            <span className="text-[11px] font-black text-gray-300">
              كلمة المرور الجديدة
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="8 أحرف على الأقل"
              disabled={!passwordChangeStatus.allowed}
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50 disabled:opacity-45"
            />
          </label>

          <label className="mt-3 block">
            <span className="text-[11px] font-black text-gray-300">
              تأكيد كلمة المرور
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              placeholder="أعد كتابة كلمة المرور"
              disabled={!passwordChangeStatus.allowed}
              className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50 disabled:opacity-45"
            />
          </label>

          <button
            type="button"
            onClick={changePassword}
            disabled={
              changingPassword ||
              !passwordChangeStatus.allowed
            }
            className="mt-4 flex w-full items-center justify-center rounded-[18px] border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-3.5 text-sm font-black text-fuchsia-200 transition active:scale-[0.98] disabled:opacity-45"
          >
            {changingPassword
              ? "جاري تغيير كلمة المرور..."
              : "تغيير كلمة المرور"}
          </button>
        </section>

        {message && (
          <div className="mt-4 rounded-[20px] border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-center text-[11px] font-bold leading-5 text-emerald-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-[20px] border border-red-400/15 bg-red-500/10 px-4 py-3 text-center text-[11px] font-bold leading-5 text-red-300">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-red-400/15 bg-red-500/10 px-5 py-3.5 text-sm font-black text-red-300 transition active:scale-[0.98] disabled:opacity-60"
        >
          <span>↪</span>
          <span>
            {loggingOut
              ? "جاري تسجيل الخروج..."
              : "تسجيل الخروج"}
          </span>
        </button>
      </section>

      <BottomNav />
    </main>
  );
}