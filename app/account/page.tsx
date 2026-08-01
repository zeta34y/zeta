"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

function getAuthErrorMessage(error: unknown, fallback: string) {
  const message =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : error instanceof Error
        ? error.message
        : "";

  const normalized = message.toLowerCase();

  if (
    normalized.includes("expired") ||
    normalized.includes("otp_expired")
  ) {
    return "انتهت صلاحية الرمز. أرسل طلب تغيير البريد مرة أخرى.";
  }

  if (
    normalized.includes("invalid") ||
    normalized.includes("token") ||
    normalized.includes("otp")
  ) {
    return "رمز التحقق غير صحيح أو انتهت صلاحيته.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many")
  ) {
    return "تم إرسال محاولات كثيرة. انتظر قليلًا ثم حاول مرة أخرى.";
  }

  if (
    normalized.includes("already") &&
    normalized.includes("registered")
  ) {
    return "هذا البريد مستخدم في حساب آخر.";
  }

  return message || fallback;
}

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [emailVerificationOpen, setEmailVerificationOpen] =
    useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [currentEmailCode, setCurrentEmailCode] = useState("");
  const [newEmailCode, setNewEmailCode] = useState("");
  const [currentEmailVerified, setCurrentEmailVerified] =
    useState(false);
  const [verifyingEmailChange, setVerifyingEmailChange] =
    useState(false);

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

  const normalizedCurrentEmail = (user?.email || "")
    .trim()
    .toLowerCase();
  const normalizedEnteredEmail = email.trim().toLowerCase();
  const emailHasChanged =
    Boolean(normalizedEnteredEmail) &&
    normalizedEnteredEmail !== normalizedCurrentEmail;

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

  function cleanOtp(value: string) {
    return value.replace(/\D/g, "").slice(0, 8);
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
    if (
      !user ||
      savingProfile ||
      verifyingEmailChange ||
      emailVerificationOpen
    ) {
      return;
    }

    clearMessages();

    const cleanedName = name.trim();
    const cleanedEmail = email.trim().toLowerCase();
    const cleanedPhone = phone.trim();
    const shouldChangeEmail =
      Boolean(cleanedEmail) &&
      cleanedEmail !== (user.email || "").trim().toLowerCase();

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
      const profileUpdates: {
        data: {
          full_name: string;
          name: string;
        };
        phone?: string;
      } = {
        data: {
          full_name: cleanedName,
          name: cleanedName,
        },
      };

      if (
        cleanedPhone &&
        cleanedPhone !== user.phone
      ) {
        profileUpdates.phone = cleanedPhone;
      }

      const { data: profileData, error: profileError } =
        await supabase.auth.updateUser(profileUpdates);

      if (profileError) throw profileError;

      setUser(profileData.user);

      if (shouldChangeEmail) {
        const { error: emailChangeError } =
          await supabase.auth.updateUser({
            email: cleanedEmail,
          });

        if (emailChangeError) throw emailChangeError;

        setPendingEmail(cleanedEmail);
        setCurrentEmailCode("");
        setNewEmailCode("");
        setCurrentEmailVerified(false);
        setEmailVerificationOpen(true);
        setMessage(
          user.email
            ? "أرسلنا رمزًا إلى بريدك الحالي ورمزًا إلى البريد الجديد. أدخل الرمزين لإكمال التغيير."
            : "أرسلنا رمز تحقق إلى البريد الجديد. أدخل الرمز لإكمال إضافته."
        );
      } else {
        setMessage("تم تحديث بيانات حسابك بنجاح.");
      }

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated", {
          detail: profileData.user,
        })
      );
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "تعذر حفظ بيانات الحساب"
        )
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function verifyEmailChange() {
    if (!user || !pendingEmail || verifyingEmailChange) return;

    clearMessages();

    const oldEmail = (user.email || "").trim().toLowerCase();
    const oldCode = currentEmailCode.trim();
    const nextCode = newEmailCode.trim();

    if (
      oldEmail &&
      !currentEmailVerified &&
      oldCode.length < 6
    ) {
      setErrorMessage("اكتب الرمز المرسل إلى بريدك الحالي.");
      return;
    }

    if (nextCode.length < 6) {
      setErrorMessage("اكتب الرمز المرسل إلى البريد الجديد.");
      return;
    }

    setVerifyingEmailChange(true);

    try {
      if (oldEmail && !currentEmailVerified) {
        const { error: currentEmailError } =
          await supabase.auth.verifyOtp({
            email: oldEmail,
            token: oldCode,
            type: "email_change",
          });

        if (currentEmailError) throw currentEmailError;

        setCurrentEmailVerified(true);
      }

      const { error: newEmailError } =
        await supabase.auth.verifyOtp({
          email: pendingEmail,
          token: nextCode,
          type: "email_change",
        });

      if (newEmailError) throw newEmailError;

      const {
        data: { user: refreshedUser },
        error: refreshError,
      } = await supabase.auth.getUser();

      if (refreshError) throw refreshError;

      const updatedUser = refreshedUser || user;

      setUser(updatedUser);
      setEmail(updatedUser.email || pendingEmail);
      setPendingEmail("");
      setCurrentEmailCode("");
      setNewEmailCode("");
      setCurrentEmailVerified(false);
      setEmailVerificationOpen(false);
      setMessage("تم تغيير البريد الإلكتروني وتأكيده بنجاح.");

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated", {
          detail: updatedUser,
        })
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error,
          "تعذر التحقق من رموز تغيير البريد"
        )
      );
    } finally {
      setVerifyingEmailChange(false);
    }
  }

  function abandonEmailChange() {
    setEmailVerificationOpen(false);
    setPendingEmail("");
    setCurrentEmailCode("");
    setNewEmailCode("");
    setCurrentEmailVerified(false);
    setEmail(user?.email || "");
    clearMessages();
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
                  readOnly={emailVerificationOpen}
                  className="min-w-0 flex-1 bg-transparent py-4 text-left text-sm text-white outline-none placeholder:text-gray-600 read-only:cursor-not-allowed read-only:opacity-60"
                />
              </div>

              <p className="mt-2 text-[9px] leading-5 text-gray-500">
                تغيير البريد يتطلب تأكيد البريد الحالي والجديد قبل اعتماده.
              </p>
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
              disabled={
                savingProfile ||
                verifyingEmailChange ||
                emailVerificationOpen
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black shadow-xl shadow-violet-950/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {savingProfile
                  ? "جاري الحفظ..."
                  : emailVerificationOpen
                    ? "بانتظار تأكيد البريد"
                    : emailHasChanged
                      ? "حفظ وإرسال رموز التحقق"
                      : "حفظ التغييرات"}
              </span>
              {!savingProfile && !emailVerificationOpen && (
                <span>✓</span>
              )}
            </button>
          </div>
        </section>

        {emailVerificationOpen && pendingEmail && (
          <section className="mt-4 overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[#121019] shadow-xl">
            <div className="relative overflow-hidden border-b border-white/[0.06] p-4">
              <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold text-cyan-300">
                    حماية البريد
                  </p>
                  <h2 className="mt-1 text-base font-black">
                    تأكيد تغيير البريد
                  </h2>
                  <p className="mt-1 text-[10px] leading-5 text-gray-500">
                    لن يتغير البريد حتى يتم التحقق من الرموز المطلوبة.
                  </p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                  🛡️
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-[20px] border border-white/[0.07] bg-black/20 p-3">
                {user.email && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[9px] text-gray-500">
                      البريد الحالي
                    </span>
                    <span
                      dir="ltr"
                      className="break-all text-left text-[10px] font-bold text-gray-300"
                    >
                      {user.email}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-start justify-between gap-3 ${
                    user.email
                      ? "mt-3 border-t border-white/[0.06] pt-3"
                      : ""
                  }`}
                >
                  <span className="text-[9px] text-gray-500">
                    البريد الجديد
                  </span>
                  <span
                    dir="ltr"
                    className="break-all text-left text-[10px] font-bold text-cyan-200"
                  >
                    {pendingEmail}
                  </span>
                </div>
              </div>

              {user.email && !currentEmailVerified && (
                <label className="block">
                  <span className="text-[11px] font-black text-gray-300">
                    رمز البريد الحالي
                  </span>
                  <p className="mt-1 text-[9px] leading-5 text-gray-500">
                    افتح بريدك الحالي وانسخ رمز التحقق المرسل إليه.
                  </p>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    dir="ltr"
                    value={currentEmailCode}
                    onChange={(event) =>
                      setCurrentEmailCode(
                        cleanOtp(event.target.value)
                      )
                    }
                    maxLength={8}
                    placeholder="000000"
                    className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-lg font-black tracking-[0.35em] text-white outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                  />
                </label>
              )}

              {user.email && currentEmailVerified && (
                <div className="rounded-[20px] border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-[10px] font-bold text-emerald-300">
                  ✓ تم تأكيد البريد الحالي، أكمل رمز البريد الجديد.
                </div>
              )}

              <label className="block">
                <span className="text-[11px] font-black text-gray-300">
                  رمز البريد الجديد
                </span>
                <p className="mt-1 text-[9px] leading-5 text-gray-500">
                  افتح البريد الجديد وانسخ رمز التحقق المرسل إليه.
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  dir="ltr"
                  value={newEmailCode}
                  onChange={(event) =>
                    setNewEmailCode(
                      cleanOtp(event.target.value)
                    )
                  }
                  maxLength={8}
                  placeholder="000000"
                  className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-lg font-black tracking-[0.35em] text-white outline-none transition placeholder:text-gray-700 focus:border-cyan-400/50"
                />
              </label>

              <button
                type="button"
                onClick={verifyEmailChange}
                disabled={verifyingEmailChange}
                className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-l from-cyan-600 to-violet-600 px-5 py-4 text-sm font-black shadow-xl shadow-cyan-950/20 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyingEmailChange ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد وتغيير البريد</span>
                    <span>✓</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={abandonEmailChange}
                disabled={verifyingEmailChange}
                className="w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-[10px] font-black text-gray-400 transition hover:bg-white/[0.07] active:scale-[0.98] disabled:opacity-50"
              >
                إغلاق التحقق واستخدام البريد الحالي
              </button>
            </div>
          </section>
        )}

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