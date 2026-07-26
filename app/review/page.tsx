"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type StoreReview = {
  id: string;
  customer_name: string;
  review_text: string;
  rating: number;
  created_at: string;
};

export default function ReviewPage() {
  const [customerName, setCustomerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const shownRating = hoveredRating || rating;

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return Math.round((total / reviews.length) * 10) / 10;
  }, [reviews]);

  useEffect(() => {
    let mounted = true;

    async function loadUserName() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || !user) return;

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "";

        if (name) {
          setCustomerName(String(name).slice(0, 40));
        }
      } catch {
        // الزائر يكتب الاسم بنفسه.
      }
    }

    void loadUserName();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from("store_reviews")
          .select(
            "id, customer_name, review_text, rating, created_at"
          )
          .eq("is_visible", true)
          .order("created_at", { ascending: false })
          .limit(12);

        if (!mounted) return;

        if (error) {
          setReviews([]);
          return;
        }

        setReviews((data ?? []) as StoreReview[]);
      } catch {
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) {
          setLoadingReviews(false);
        }
      }
    }

    void loadReviews();

    function refreshReviews() {
      void loadReviews();
    }

    const channel = supabase
      .channel("zeta-review-page")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_reviews",
        },
        refreshReviews
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function submitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    const cleanName = customerName.trim().replace(/\s+/g, " ");
    const cleanReview = reviewText.trim().replace(/\s+/g, " ");

    setMessage("");
    setErrorMessage("");

    if (cleanName.length < 2) {
      setErrorMessage("اكتب اسمًا من حرفين على الأقل");
      return;
    }

    if (cleanReview.length < 10) {
      setErrorMessage("اكتب تجربتك في 10 أحرف على الأقل");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc(
        "submit_store_review_v2",
        {
          p_customer_name: cleanName,
          p_review_text: cleanReview,
          p_rating: rating,
        }
      );

      if (error) {
        throw error;
      }

      if (!data || typeof data !== "object") {
        throw new Error("لم يرجع التقييم بعد الحفظ");
      }

      const savedReview = data as StoreReview;

      setReviews((current) => [
        savedReview,
        ...current.filter(
          (review) => review.id !== savedReview.id
        ),
      ]);

      setReviewText("");
      setRating(5);
      setHoveredRating(0);
      setMessage(
        "شكرًا لك، تم نشر تقييمك وسيظهر في الصفحة الرئيسية"
      );

      window.dispatchEvent(
        new CustomEvent("zeta-review-added", {
          detail: savedReview,
        })
      );
    } catch (error) {
      const databaseMessage =
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "";

      const databaseCode =
        error &&
        typeof error === "object" &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
          ? (error as { code: string }).code
          : "";

      setErrorMessage(
        databaseMessage
          ? `${databaseMessage}${
              databaseCode ? ` — ${databaseCode}` : ""
            }`
          : "تعذر إرسال التقييم، حاول مرة أخرى"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[#08070d] pb-36 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-violet-700/15 blur-[135px]" />
        <div className="absolute -left-32 top-[530px] h-[390px] w-[390px] rounded-full bg-fuchsia-700/10 blur-[135px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-xl font-black shadow-lg shadow-violet-950/30">
              Z
            </div>

            <div>
              <h1 className="text-lg font-black tracking-wider">
                ZETA
              </h1>
              <p className="text-[10px] text-gray-500">
                تقييم المتجر
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-[11px] font-black text-gray-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 active:scale-95"
          >
            <span>الرئيسية</span>
            <span>←</span>
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 py-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[34px] border border-violet-400/15 bg-gradient-to-br from-[#191426] via-[#12101b] to-[#0d0b12] p-5 shadow-[0_30px_90px_rgba(76,29,149,0.2)] sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />

            <div className="relative">
              <span className="inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-[11px] font-black text-violet-300">
                رأيك يهمنا ⭐
              </span>

              <h2 className="mt-5 text-3xl font-black sm:text-4xl">
                قيّم تجربتك مع ZETA
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-gray-400">
                شاركنا رأيك، وسيظهر تقييمك في قسم آراء عملائنا
                بالصفحة الرئيسية.
              </p>

              <form onSubmit={submitReview} className="mt-7 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-black text-gray-300">
                    اسمك
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(event) => {
                      setCustomerName(event.target.value.slice(0, 40));
                      setErrorMessage("");
                    }}
                    placeholder="اكتب اسمك"
                    maxLength={40}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50 focus:bg-violet-500/[0.04]"
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-black text-gray-300">
                      عدد النجوم
                    </label>

                    <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-black text-amber-300">
                      {shownRating} من 5
                    </span>
                  </div>

                  <div
                    className="flex justify-center gap-2 rounded-2xl border border-white/[0.07] bg-black/15 px-4 py-5"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {Array.from({ length: 5 }).map((_, index) => {
                      const starValue = index + 1;
                      const active = starValue <= shownRating;

                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() =>
                            setHoveredRating(starValue)
                          }
                          onFocus={() =>
                            setHoveredRating(starValue)
                          }
                          onBlur={() => setHoveredRating(0)}
                          onClick={() => {
                            setRating(starValue);
                            setErrorMessage("");
                          }}
                          aria-label={`${starValue} نجوم`}
                          className={`text-4xl transition duration-150 active:scale-90 ${
                            active
                              ? "scale-110 text-amber-400 drop-shadow-[0_0_16px_rgba(251,191,36,0.4)]"
                              : "text-white/15"
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-black text-gray-300">
                      تجربتك
                    </label>

                    <span className="text-[10px] text-gray-600">
                      {reviewText.length}/500
                    </span>
                  </div>

                  <textarea
                    value={reviewText}
                    onChange={(event) => {
                      setReviewText(event.target.value.slice(0, 500));
                      setErrorMessage("");
                    }}
                    placeholder="اكتب رأيك عن المتجر والخدمة..."
                    maxLength={500}
                    rows={6}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50 focus:bg-violet-500/[0.04]"
                  />
                </div>

                {errorMessage && (
                  <div className="rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
                    {errorMessage}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-xs font-bold leading-6 text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-6 py-4 text-sm font-black shadow-xl shadow-violet-950/30 transition hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {submitting
                      ? "جاري إرسال التقييم..."
                      : "نشر التقييم"}
                  </span>
                  <span>{submitting ? "⏳" : "⭐"}</span>
                </button>
              </form>
            </div>
          </div>

          <aside className="h-fit rounded-[34px] border border-white/[0.08] bg-[#111019] p-5 sm:p-7 lg:sticky lg:top-24">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-br from-amber-400/20 to-orange-500/10 text-4xl">
                ⭐
              </div>

              <h3 className="mt-4 text-xl font-black">
                تقييمات عملائنا
              </h3>

              {reviews.length > 0 && (
                <>
                  <p className="mt-3 text-4xl font-black text-amber-400">
                    {averageRating}
                  </p>

                  <div className="mt-2 flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={index}
                        className={
                          index < Math.round(averageRating)
                            ? "text-amber-400"
                            : "text-white/10"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <p className="mt-2 text-[11px] text-gray-500">
                    بناءً على {reviews.length} تقييم
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 max-h-[530px] space-y-3 overflow-y-auto pl-1">
              {loadingReviews ? (
                <div className="flex min-h-[230px] items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-violet-400/20 bg-violet-500/[0.04] px-5 py-10 text-center">
                  <p className="text-sm font-black">
                    لا توجد تقييمات حتى الآن
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    كن أول من يشارك تجربته.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-black">
                          {review.customer_name}
                        </h4>

                        <div className="mt-1 flex gap-0.5 text-[11px]">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <span
                              key={index}
                              className={
                                index < review.rating
                                  ? "text-amber-400"
                                  : "text-white/10"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <span className="text-3xl font-black leading-none text-violet-500/20">
                        “
                      </span>
                    </div>

                    <p className="mt-3 break-words text-xs leading-6 text-gray-400">
                      {review.review_text}
                    </p>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}