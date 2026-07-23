"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type LoginSheetProps = {
  open: boolean;
  onClose: () => void;
};

type LoginMethod = "email" | "phone";
type LoginStep = "identifier" | "otp";

const countries = [
  { name: "السعودية", code: "+966", flag: "🇸🇦", digits: 9 },
  { name: "الإمارات", code: "+971", flag: "🇦🇪", digits: 9 },
  { name: "الكويت", code: "+965", flag: "🇰🇼", digits: 8 },
  { name: "البحرين", code: "+973", flag: "🇧🇭", digits: 8 },
  { name: "قطر", code: "+974", flag: "🇶🇦", digits: 8 },
  { name: "عُمان", code: "+968", flag: "🇴🇲", digits: 8 },
  { name: "مصر", code: "+20", flag: "🇪🇬", digits: 10 },
  { name: "الأردن", code: "+962", flag: "🇯🇴", digits: 9 },
  { name: "العراق", code: "+964", flag: "🇮🇶", digits: 10 },
  { name: "سوريا", code: "+963", flag: "🇸🇾", digits: 9 },
  { name: "تركيا", code: "+90", flag: "🇹🇷", digits: 10 },
  { name: "المملكة المتحدة", code: "+44", flag: "🇬🇧", digits: 10 },
  { name: "الولايات المتحدة", code: "+1", flag: "🇺🇸", digits: 10 },
];

export default function LoginSheet({
  open,
  onClose,
}: LoginSheetProps) {
  const [method, setMethod] = useState<LoginMethod>("email");
  const [step, setStep] = useState<LoginStep>("identifier");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCountry = useMemo(
    () =>
      countries.find((country) => country.code === countryCode) ??
      countries[0],
    [countryCode]
  );

  const otpLength = method === "email" ? 8 : 6;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      window.addEventListener("keydown", closeWithEscape);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(() => {
        setStep("identifier");
        setOtp("");
        setMessage("");
        setErrorMessage("");
        setCountryMenuOpen(false);
        setResendSeconds(0);
      }, 350);

      return () => window.clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session?.user) return;

        window.dispatchEvent(
          new CustomEvent("zeta-auth-updated", {
            detail: session.user,
          })
        );

        if (open) {
          onClose();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendSeconds]);

  function cleanPhone(value: string) {
    let numbers = value.replace(/\D/g, "");

    if (countryCode === "+966") {
      if (numbers.startsWith("966")) {
        numbers = numbers.slice(3);
      }

      if (numbers.startsWith("0")) {
        numbers = numbers.slice(1);
      }

      numbers = numbers.slice(0, 9);
    } else {
      numbers = numbers.slice(0, selectedCountry.digits);
    }

    setPhone(numbers);
  }

  function cleanEmail(value: string) {
    const cleaned = value
      .replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "")
      .replace(/\s/g, "")
      .replace(/[^a-zA-Z0-9@._+-]/g, "")
      .toLowerCase();

    setEmail(cleaned);
  }

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
  }

  function validatePhone() {
    if (countryCode === "+966") {
      return /^5\d{8}$/.test(phone);
    }

    return phone.length === selectedCountry.digits;
  }

  async function sendOtp() {
    setErrorMessage("");
    setMessage("");

    if (method === "email" && !validateEmail(email)) {
      setErrorMessage("اكتب بريدًا إلكترونيًا صحيحًا");
      return;
    }

    if (method === "phone" && !validatePhone()) {
      setErrorMessage(
        countryCode === "+966"
          ? "اكتب رقمًا سعوديًا صحيحًا يبدأ بـ 5 ويتكوّن من 9 أرقام"
          : `اكتب رقمًا صحيحًا من ${selectedCountry.digits} أرقام`
      );
      return;
    }

    setLoading(true);

    try {
      if (method === "email") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) throw error;
      } else {
        const fullPhone = `${countryCode}${phone}`;

        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhone,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) throw error;
      }

      setStep("otp");
      setResendSeconds(60);
      setMessage(
        method === "email"
          ? "أرسلنا رمز التحقق إلى بريدك"
          : `أرسلنا رمز التحقق إلى ${countryCode}${phone}`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر إرسال رمز التحقق"
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setErrorMessage("");
    setMessage("");

    if (otp.length !== otpLength) {
      setErrorMessage(
        `رمز التحقق يجب أن يتكوّن من ${otpLength} أرقام`
      );
      return;
    }

    setLoading(true);

    try {
      if (method === "email") {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otp,
          type: "email",
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: `${countryCode}${phone}`,
          token: otp,
          type: "sms",
        });

        if (error) throw error;
      }

      setMessage("تم تسجيل الدخول بنجاح");

      window.dispatchEvent(
        new CustomEvent("zeta-auth-updated")
      );

      window.setTimeout(() => {
        onClose();
        window.location.href = "/account";
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "رمز التحقق غير صحيح أو منتهي"
      );
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setErrorMessage("");
    setMessage("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

    if (
      !supabaseUrl ||
      !supabaseUrl.startsWith("https://") ||
      !supabaseUrl.endsWith(".supabase.co")
    ) {
      setErrorMessage(
        "رابط Supabase غير صحيح داخل ملف .env.local. انسخ Project URL كاملًا من Supabase ثم أعد تشغيل الموقع."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/account`,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;

      if (!data.url) {
        throw new Error(
"فعّل تسجيل Google من Supabase أولًا"
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setLoading(false);

      const message =
        error instanceof Error ? error.message : "تعذر بدء تسجيل الدخول";

      if (
        message.toLowerCase().includes("provider") ||
        message.toLowerCase().includes("unsupported")
      ) {
        setErrorMessage(
"تسجيل Google غير مفعّل بعد في Supabase"
        );
        return;
      }

      setErrorMessage(message);
    }
  }

  function changeMethod(nextMethod: LoginMethod) {
    setMethod(nextMethod);
    setStep("identifier");
    setOtp("");
    setMessage("");
    setErrorMessage("");
  }

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[500] transition duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="إغلاق تسجيل الدخول"
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="تسجيل الدخول"
        className={`absolute bottom-0 left-0 right-0 mx-auto max-h-[94vh] w-[92%] max-w-[430px] sm:w-full sm:max-w-xl overflow-y-auto rounded-[30px] border-x border-t border-violet-300/15 bg-[#0e0b15] px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-30px_90px_rgba(76,29,149,0.4)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:bottom-6 sm:max-w-lg sm:rounded-[34px] sm:border ${
          open
            ? "translate-y-0"
            : "translate-y-[110%]"
        }`}
      >
        <div className="mx-auto h-1.5 w-14 rounded-full bg-white/15" />

        <div className="mt-5 flex items-start justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-gray-300 transition hover:bg-white/10 active:scale-90"
          >
            ×
          </button>

          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <div>
                <h2 className="text-xl font-black">تسجيل الدخول</h2>
                <p className="mt-1 text-xs text-gray-500">
                  ادخل إلى حسابك في ZETA
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-950/40">
                Z
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-[20px] border border-white/[0.07] bg-white/[0.03] p-1.5">
          <button
            type="button"
            onClick={() => changeMethod("email")}
            className={`rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs ${
              method === "email"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                : "text-gray-500"
            }`}
          >
            البريد الإلكتروني
          </button>

          <button
            type="button"
            onClick={() => changeMethod("phone")}
            className={`rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-2xl sm:px-4 sm:py-3 sm:text-xs ${
              method === "phone"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                : "text-gray-500"
            }`}
          >
            رقم الجوال
          </button>
        </div>

        {step === "identifier" ? (
          <div className="mt-5">
            {method === "email" ? (
              <label className="block">
                <span className="text-xs font-black text-gray-300">
                  البريد الإلكتروني
                </span>

                <div className="mt-2 flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 transition focus-within:border-violet-400/50">
                  <span className="text-lg">✉️</span>

                  <input
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => cleanEmail(event.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    maxLength={120}
                    className="min-w-0 flex-1 bg-transparent text-left text-sm text-white outline-none placeholder:text-gray-600"
                    dir="ltr"
                  />
                </div>
              </label>
            ) : (
              <div>
                <span className="text-xs font-black text-gray-300">
                  رقم الجوال
                </span>

                <div className="relative mt-2 flex items-stretch rounded-[20px] border border-white/10 bg-white/[0.04] transition focus-within:border-violet-400/50">
                  <button
                    type="button"
                    onClick={() =>
                      setCountryMenuOpen((current) => !current)
                    }
                    className="flex shrink-0 items-center gap-2 border-l border-white/10 px-3 text-xs font-black text-white"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span dir="ltr">{selectedCountry.code}</span>
                    <span className="text-[9px] text-gray-500">▼</span>
                  </button>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(event) => cleanPhone(event.target.value)}
                    placeholder={
                      countryCode === "+966"
                        ? "5XXXXXXXX"
                        : "رقم الجوال"
                    }
                    autoComplete="tel-national"
                    className="min-w-0 flex-1 bg-transparent px-4 py-4 text-left text-sm tracking-wider text-white outline-none placeholder:text-gray-600"
                    dir="ltr"
                  />

                  {countryMenuOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-[20px] border border-violet-400/15 bg-[#171322] p-2 shadow-2xl">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(country.code);
                            setPhone("");
                            setCountryMenuOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-xs transition hover:bg-violet-500/10"
                        >
                          <span className="font-bold text-gray-300">
                            {country.name}
                          </span>

                          <span className="flex items-center gap-2">
                            <span dir="ltr">{country.code}</span>
                            <span>{country.flag}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {countryCode === "+966" && (
                  <p className="mt-2 text-[10px] leading-5 text-gray-600">
                    اكتب الرقم بدون الصفر، مثال: 5XXXXXXXX
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "جاري إرسال الرمز..."
                : method === "email"
                ? "إرسال الرمز إلى البريد"
                : "إرسال الرمز إلى الجوال"}
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => {
                setStep("identifier");
                setOtp("");
                setMessage("");
                setErrorMessage("");
              }}
              className="text-xs font-black text-violet-300"
            >
              تعديل {method === "email" ? "البريد" : "رقم الجوال"}
            </button>

            <label className="mt-4 block">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-gray-300">
                  رمز التحقق
                </span>

                <span className="text-[10px] text-gray-600">
                  {otpLength} أرقام
                </span>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={otpLength}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, otpLength)
                  )
                }
                placeholder={method === "email" ? "00000000" : "000000"}
                autoComplete="one-time-code"
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-2xl font-black tracking-[7px] sm:tracking-[10px] text-white outline-none transition placeholder:text-gray-700 focus:border-violet-400/50"
                dir="ltr"
              />
            </label>

            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "جاري التحقق..." : "تأكيد وتسجيل الدخول"}
            </button>

            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || resendSeconds > 0}
              className="mt-3 w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-gray-300 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {resendSeconds > 0
                ? `إعادة الإرسال بعد ${resendSeconds} ثانية`
                : "إعادة إرسال الرمز"}
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-center text-xs font-bold text-emerald-300">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-center text-xs font-bold leading-5 text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.07]" />
          <span className="text-[10px] font-bold text-gray-600">
            أو الدخول مباشرة
          </span>
          <div className="h-px flex-1 bg-white/[0.07]" />
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-[20px] border border-white/10 bg-white px-4 py-3.5 text-sm font-black text-gray-900 shadow-sm transition hover:bg-gray-100 active:scale-[0.98] disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.24c0-.71-.06-1.39-.18-2.04H12v3.86h5.24a4.48 4.48 0 0 1-1.94 2.94v2.5h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
            />
            <path
              fill="#34A853"
              d="M12 21.75c2.62 0 4.82-.87 6.43-2.35l-3.14-2.5c-.87.58-1.98.93-3.29.93-2.53 0-4.67-1.71-5.44-4.01H3.32v2.58A9.72 9.72 0 0 0 12 21.75Z"
            />
            <path
              fill="#FBBC05"
              d="M6.56 13.82A5.85 5.85 0 0 1 6.26 12c0-.63.11-1.24.3-1.82V7.6H3.32A9.75 9.75 0 0 0 2.25 12c0 1.58.38 3.07 1.07 4.4l3.24-2.58Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.17c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.82 3.25 14.62 2.25 12 2.25A9.72 9.72 0 0 0 3.32 7.6l3.24 2.58c.77-2.3 2.91-4.01 5.44-4.01Z"
            />
          </svg>

          <span>المتابعة مع Google</span>
        </button>

        <p className="mt-6 text-center text-[10px] leading-5 text-gray-600">
          بمتابعتك أنت توافق على الشروط والأحكام وسياسة الخصوصية.
        </p>
      </section>
    </div>
  );
}