"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

const PASSWORD_LOCK_DAYS = 7;
const PASSWORD_LOCK_MS =
  PASSWORD_LOCK_DAYS * 24 * 60 * 60 * 1000;

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const displayName =
    name.trim() ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    user?.phone ||
    "مستخدم ZETA";

  const passwordChangedAt = useMemo(() => {
    const value = user?.user_metadata?.password_changed_at;

    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [user]);

  const passwordStatus = useMemo(() => {
    if (!passwordChangedAt) {
      return {
        allowed: true,
        daysLeft: 0,
      };
    }

    const unlockAt =
      passwordChangedAt.getTime() + PASSWORD_LOCK_MS;

    const remaining = unlockAt - Date.now();

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

  function cleanName(value: string) {
    setName(value.slice(0, 50));
  }

  function cleanEmail(value: string) {
    setEmail(
      value
        .replace(
          /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
          ""
        )
        .replace(/\s/g, "")
        .replace(/[^a-zA-Z0-9@._+-]/g, "")
        .toLowerCase()
        .slice(0, 120)
    );
  }

  function cleanPhone(value: string) {
    setPhone(
      value.replace(/[^\d+]/g, "").slice(0, 16)
    );
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

      if (
        cleanedEmail &&
        cleanedEmail !== user.email
      ) {
        updates.email = cleanedEmail;
      }

      if (
        cleanedPhone &&
        cleanedPhone !== user.phone
      ) {
        updates.phone = cleanedPhone;
      }

      const { data, error } =
        await supabase.auth.updateUser(updates);

      if (error) throw error;

      setUser(data.user);

      setMessage(
        updates.email || updates.phone
          ? "تم حفظ البيانات. قد تحتاج إلى تأكيد البريد أو الجوال الجديد."
          : "تم تحديث اسمك وبيانات حسابك بنجاح."
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

    if (!passwordStatus.allowed) {
      setErrorMessage(
        `يمكنك تغيير كلمة المرور بعد ${passwordStatus.daysLeft} ${
          passwordStatus.daysLeft === 1
            ? "يوم"
            : "أيام"
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
        "تم تغيير كلمة المرور بنجاح. يمكنك تغييرها مرة أخرى بعد 7 أيام."
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
          <p className="mt-4 text-xs text-gray-400">
            جاري تحميل الحساب...
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-24 top-0 h-[340px] w-[340px] rounded-full bg-violet-700/15 blur-[120px]" />
        <div className="absolute -left-24 top-[470px] h-[320px] w-[320px] rounded-full bg-fuchsia-700/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[9px] font-bold text-violet-400">
              إعدادات المستخدم
            </p>
            <h1 className="mt-1 text-lg font-black">
              حسابي
            </h1>
          </div>

          <Link
            href="/"
            aria-label="إغلاق صفحة الحساب"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg text-gray-200 transition hover:bg-white/10 active:scale-95"
          >
            ×
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="relative overflow-hidden rounded-[30px] border border-violet-400/15 bg-[radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.32),transparent_32%),linear-gradient(135deg,#181124,#0e0b15)] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
          <div className="absolute -left-12 -top-12 h-36 w-36 rounded-full bg-fuchsia-600/10 blur-3xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-3xl font-black shadow-xl shadow-violet-950/40">
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
                <h2 className="truncate text-xl font-black">
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
                className="mt-2 truncate text-left text-[11px] text-gray-500"
              >
                {user.email || user.phone || "حساب ZETA"}
              </p>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-500/[0.07] px-3 py-1.5 text-[9px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                الحساب نشط
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="mt-3 flex items-center justify-between rounded-[24px] border border-amber-400/20 bg-gradient-to-l from-amber-500/10 to-orange-500/[0.06] p-4 transition hover:bg-amber-500/15 active:scale-[0.99]"
          >
            <div>
              <p className="text-[9px] font-bold text-amber-400">
                صلاحية خاصة
              </p>
              <h3 className="mt-1 text-sm font-black">
                إدارة المتجر
              </h3>
            </div>

            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-2xl">
              ⚙️
            </span>
          </Link>
        )}

        <section className="mt-4 overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#121019] shadow-xl">
          <div className="border-b border-white/[0.06] p-4">
            <p className="text-[9px] font-bold text-violet-400">
              الملف الشخصي
            </p>
            <h2 className="mt-1 text-base font-black">
              بيانات الحساب
            </h2>
            <p className="mt-1 text-[10px] leading-5 text-gray-500">
              عدّل اسمك أو بيانات التواصل ثم اضغط حفظ.
            </p>
          </div>

          <div className="p-4">
            <label className="block">
              <span className="text-[11px] font-black text-gray-300">
                اسم المستخدم
              </span>

              <div className="mt-2 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-violet-400/50">
                <span className="text-lg">👤</span>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    cleanName(event.target.value)
                  }
                  maxLength={50}
                  autoComplete="name"
                  placeholder="اكتب اسمك"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-600"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-[11px] font-black text-gray-300">
                البريد الإلكتروني
              </span>

              <div className="mt-2 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-violet-400/50">
                <span className="text-lg">✉️</span>

                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(event) =>
                    cleanEmail(event.target.value)
                  }
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="min-w-0 flex-1 bg-transparent py-4 text-left text-sm text-white outline-none placeholder:text-gray-600"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-[11px] font-black text-gray-300">
                رقم الجوال
              </span>

              <div className="mt-2 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-violet-400/50">
                <span className="text-lg">📱</span>

                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(event) =>
                    cleanPhone(event.target.value)
                  }
                  autoComplete="tel"
                  placeholder="+9665XXXXXXXX"
                  className="min-w-0 flex-1 bg-transparent py-4 text-left text-sm tracking-wide text-white outline-none placeholder:text-gray-600"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black shadow-xl shadow-violet-950/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {savingProfile
                  ? "جاري الحفظ..."
                  : "حفظ التغييرات"}
              </span>
              {!savingProfile && <span>✓</span>}
            </button>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#121019] shadow-xl">
          <div className="relative overflow-hidden border-b border-white/[0.06] p-4">
            <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-fuchsia-600/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold text-fuchsia-400">
                  الأمان
                </p>
                <h2 className="mt-1 text-base font-black">
                  تغيير كلمة المرور
                </h2>
                <p className="mt-1 text-[10px] leading-5 text-gray-500">
                  اختر كلمة قوية لا تستخدمها في مكان آخر.
                </p>
              </div>

              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-2xl">
                🔒
              </span>
            </div>
          </div>

          <div className="p-4">
            {!passwordStatus.allowed && (
              <div className="mb-4 rounded-[20px] border border-amber-400/15 bg-amber-500/10 px-4 py-3 text-[11px] font-bold leading-5 text-amber-300">
                يمكنك تغيير كلمة المرور بعد{" "}
                {passwordStatus.daysLeft}{" "}
                {passwordStatus.daysLeft === 1
                  ? "يوم"
                  : "أيام"}
              </div>
            )}

            <label className="block">
              <span className="text-[11px] font-black text-gray-300">
                كلمة المرور الجديدة
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-fuchsia-400/50">
                <input
                  type={
                    showNewPassword ? "text" : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  placeholder="8 أحرف على الأقل"
                  disabled={!passwordStatus.allowed}
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-600 disabled:opacity-45"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((current) => !current)
                  }
                  disabled={!passwordStatus.allowed}
                  className="shrink-0 text-xs text-gray-400 disabled:opacity-30"
                >
                  {showNewPassword ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </label>

            <label className="mt-4 block">
              <span className="text-[11px] font-black text-gray-300">
                تأكيد كلمة المرور
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-fuchsia-400/50">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="أعد كتابة كلمة المرور"
                  disabled={!passwordStatus.allowed}
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-gray-600 disabled:opacity-45"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={!passwordStatus.allowed}
                  className="shrink-0 text-xs text-gray-400 disabled:opacity-30"
                >
                  {showConfirmPassword
                    ? "إخفاء"
                    : "إظهار"}
                </button>
              </div>
            </label>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="text-[8px] text-gray-500">
                  الطول
                </p>
                <p className="mt-1 text-[10px] font-black">
                  8+
                </p>
              </div>

              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="text-[8px] text-gray-500">
                  بدون
                </p>
                <p className="mt-1 text-[10px] font-black">
                  مسافات
                </p>
              </div>

              <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="text-[8px] text-gray-500">
                  التغيير
                </p>
                <p className="mt-1 text-[10px] font-black">
                  كل 7 أيام
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={changePassword}
              disabled={
                changingPassword ||
                !passwordStatus.allowed
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] border border-fuchsia-400/20 bg-gradient-to-l from-fuchsia-600/20 to-violet-600/15 px-5 py-4 text-sm font-black text-fuchsia-100 transition hover:border-fuchsia-400/40 hover:bg-fuchsia-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span>
                {changingPassword
                  ? "جاري تغيير كلمة المرور..."
                  : "تحديث كلمة المرور"}
              </span>
              {!changingPassword && <span>🔐</span>}
            </button>
          </div>
        </section>

        {message && (
          <div className="mt-4 rounded-[22px] border border-emerald-400/15 bg-emerald-500/10 px-4 py-3.5 text-center text-[11px] font-bold leading-5 text-emerald-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-[22px] border border-red-400/15 bg-red-500/10 px-4 py-3.5 text-center text-[11px] font-bold leading-5 text-red-300">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[22px] border border-red-400/15 bg-red-500/10 px-5 py-4 text-sm font-black text-red-300 transition hover:bg-red-500/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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