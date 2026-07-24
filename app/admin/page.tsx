"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AdminTab = "users" | "notifications" | "offers" | "announcement";

type AnnouncementBar = {
  id: number;
  text: string;
  emoji: string | null;
  link_url: string | null;
  is_visible: boolean;
};

type ProductOption = {
  id: string;
  name: string;
  price: number;
  cover_url: string | null;
};

type OfferRow = {
  id: string;
  title: string;
  product_id: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
};

type OffersHeroSettings = {
  id: number;
  badge_text: string;
  title: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  is_visible: boolean;
};

type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_blocked: boolean;
  last_sign_in_at: string | null;
  created_at: string;
};

type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "rejected";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type OrderItem = {
  id: string;
  item_name: string;
  item_type: "product" | "package";
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Payment = {
  id: string;
  provider: string | null;
  transaction_id: string | null;
  method: string | null;
  status: PaymentStatus;
  amount: number;
  currency: string;
  failure_reason: string | null;
  paid_at: string | null;
};

type UserOrder = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  subtotal: number;
  discount_amount: number;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  rejection_reason: string | null;
  cancellation_reason: string | null;
  paid_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  payments?: Payment[];
};

const defaultAnnouncement: AnnouncementBar = {
  id: 1,
  text: "افتتاح متجر ZETA — خصم 10%",
  emoji: "🎉",
  link_url: "",
  is_visible: true,
};

const defaultOffersHero: OffersHeroSettings = {
  id: 1,
  badge_text: "عروض محدودة 🔥",
  title: "وفّر أكثر على ألعابك المفضلة",
  description:
    "اشترِ ألعابك الرقمية بأسعار رمزية واستلمها مباشرة بعد الدفع.",
  primary_button_text: "تسوق الآن",
  primary_button_link: "/",
  secondary_button_text: "اكتشف العروض",
  secondary_button_link: "#offers",
  is_visible: true,
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  processing: "قيد التجهيز",
  delivered: "تم الإرسال",
  completed: "مكتمل",
  cancelled: "ملغي",
  refunded: "مسترجع",
  rejected: "مرفوض",
};

const statusClass: Record<OrderStatus, string> = {
  pending: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  paid: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  processing: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  delivered: "border-violet-400/20 bg-violet-500/10 text-violet-300",
  completed: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-400/20 bg-red-500/10 text-red-300",
  refunded: "border-orange-400/20 bg-orange-500/10 text-orange-300",
  rejected: "border-rose-400/20 bg-rose-500/10 text-rose-300",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "بانتظار الدفع",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "مسترجع",
};

const paymentMethodLabel: Record<string, string> = {
  apple_pay: "Apple Pay",
  mada: "مدى",
  visa: "Visa",
  mastercard: "MasterCard",
};

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: unknown) {
  return `${toNumber(value).toLocaleString("ar-SA", {
    maximumFractionDigits: 2,
  })} ر.س`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<AdminTab>("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [search, setSearch] = useState("");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationAudience, setNotificationAudience] =
    useState<"all" | "user">("all");
  const [notificationUserId, setNotificationUserId] = useState("");
  const [notificationUserSearch, setNotificationUserSearch] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  const [selectedProfile, setSelectedProfile] =
    useState<Profile | null>(null);
  const [selectedOrder, setSelectedOrder] =
    useState<UserOrder | null>(null);

  const [announcement, setAnnouncement] =
    useState<AnnouncementBar>(defaultAnnouncement);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [offersHero, setOffersHero] =
    useState<OffersHeroSettings>(defaultOffersHero);
  const [offersInnerTab, setOffersInnerTab] =
    useState<"content" | "discounts">("content");
  const [savingOffersHero, setSavingOffersHero] = useState(false);

  const [timeOfferId, setTimeOfferId] = useState("");
  const [timeStartsAt, setTimeStartsAt] = useState("");
  const [timeEndsAt, setTimeEndsAt] = useState("");
  const [savingOfferTime, setSavingOfferTime] = useState(false);

  const [savingAnnouncement, setSavingAnnouncement] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const adminName = useMemo(() => {
    if (!user) return "الإدارة";

    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "الإدارة"
    );
  }, [user]);

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ar");

    if (!query) return profiles;

    return profiles.filter((profile) =>
      [
        profile.display_name,
        profile.email,
        profile.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLocaleLowerCase("ar")
            .includes(query)
        )
    );
  }, [profiles, search]);

  const selectedProfileOrders = useMemo(() => {
    if (!selectedProfile) return [];

    return orders.filter(
      (order) => order.user_id === selectedProfile.id
    );
  }, [orders, selectedProfile]);

  const filteredNotificationUsers = useMemo(() => {
    const query = notificationUserSearch
      .trim()
      .toLocaleLowerCase("ar");

    if (!query) return profiles;

    return profiles.filter((profile) =>
      [profile.display_name, profile.email, profile.phone]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLocaleLowerCase("ar")
            .includes(query)
        )
    );
  }, [profiles, notificationUserSearch]);

  const selectedProfilePaidTotal = useMemo(() => {
    return selectedProfileOrders
      .filter((order) => order.payment_status === "paid")
      .reduce(
        (total, order) => total + toNumber(order.total),
        0
      );
  }, [selectedProfileOrders]);

  useEffect(() => {
    let mounted = true;

    async function startPage() {
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

        const isAdmin =
          currentUser.app_metadata?.role === "admin" ||
          currentUser.app_metadata?.user_role === "admin";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        if (!mounted) return;

        setUser(currentUser);
        setAuthorized(true);

        await loadData();
      } catch (error) {
        console.error(
          "تعذر التحقق من صلاحية الإدارة:",
          error
        );

        router.replace("/");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    startPage();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;

        if (!currentUser) {
          router.replace("/");
          return;
        }

        const isAdmin =
          currentUser.app_metadata?.role === "admin" ||
          currentUser.app_metadata?.user_role === "admin";

        if (!isAdmin) {
          router.replace("/");
          return;
        }

        setUser(currentUser);
        setAuthorized(true);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function loadData() {
    setRefreshing(true);
    setErrorMessage("");

    try {
      const [
        profilesResult,
        ordersResult,
        announcementResult,
        productsResult,
        offersResult,
        offersHeroResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, display_name, email, phone, avatar_url, is_blocked, last_sign_in_at, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("orders")
          .select(
            "*, order_items(*), payments(*)"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("announcement_bar")
          .select(
            "id, text, emoji, link_url, is_visible"
          )
          .eq("id", 1)
          .maybeSingle(),

        supabase
          .from("products")
          .select("id, name, price, cover_url")
          .eq("is_active", true)
          .order("name", { ascending: true }),

        supabase
          .from("offers")
          .select(
            "id, title, product_id, discount_type, discount_value, starts_at, ends_at, is_active"
          )
          .not("product_id", "is", null)
          .order("created_at", { ascending: false }),

        supabase
          .from("offers_hero_settings")
          .select("*")
          .eq("id", 1)
          .maybeSingle(),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      if (announcementResult.error) {
        throw announcementResult.error;
      }

      if (productsResult.error) {
        throw productsResult.error;
      }

      if (offersResult.error) {
        throw offersResult.error;
      }

      if (offersHeroResult.error) {
        throw offersHeroResult.error;
      }

      setProfiles(
        (profilesResult.data ?? []) as Profile[]
      );

      setOrders(
        (ordersResult.data ?? []) as UserOrder[]
      );

      if (announcementResult.data) {
        setAnnouncement({
          id: 1,
          text: announcementResult.data.text ?? "",
          emoji: announcementResult.data.emoji ?? "",
          link_url:
            announcementResult.data.link_url ?? "",
          is_visible: Boolean(
            announcementResult.data.is_visible
          ),
        });
      }

      setProducts(
        (productsResult.data ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          price: toNumber(product.price),
          cover_url: product.cover_url ?? null,
        }))
      );

      setOffers(
        (offersResult.data ?? []).map((offer) => ({
          id: offer.id,
          title: offer.title,
          product_id: offer.product_id,
          discount_type: offer.discount_type,
          discount_value: toNumber(offer.discount_value),
          starts_at: offer.starts_at,
          ends_at: offer.ends_at,
          is_active: Boolean(offer.is_active),
        }))
      );

      if (offersHeroResult.data) {
        setOffersHero({
          id: 1,
          badge_text:
            offersHeroResult.data.badge_text ??
            defaultOffersHero.badge_text,
          title:
            offersHeroResult.data.title ??
            defaultOffersHero.title,
          description:
            offersHeroResult.data.description ??
            defaultOffersHero.description,
          primary_button_text:
            offersHeroResult.data.primary_button_text ??
            defaultOffersHero.primary_button_text,
          primary_button_link:
            offersHeroResult.data.primary_button_link ??
            defaultOffersHero.primary_button_link,
          secondary_button_text:
            offersHeroResult.data.secondary_button_text ??
            defaultOffersHero.secondary_button_text,
          secondary_button_link:
            offersHeroResult.data.secondary_button_link ??
            defaultOffersHero.secondary_button_link,
          is_visible: Boolean(
            offersHeroResult.data.is_visible
          ),
        });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل بيانات الإدارة"
      );
    } finally {
      setRefreshing(false);
    }
  }

  function showMessage(value: string) {
    setMessage(value);

    window.setTimeout(() => {
      setMessage("");
    }, 2400);
  }

  async function saveAnnouncement() {
    setSavingAnnouncement(true);
    setErrorMessage("");

    try {
      const text = announcement.text.trim();

      if (!text) {
        throw new Error("اكتب نص الشريط أولًا");
      }

      const { error } = await supabase
        .from("announcement_bar")
        .upsert(
          {
            id: 1,
            text,
            emoji:
              announcement.emoji?.trim() || null,
            link_url:
              announcement.link_url?.trim() || null,
            is_visible:
              announcement.is_visible,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          }
        );

      if (error) throw error;

      showMessage("تم حفظ الشريط العلوي");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ الشريط العلوي"
      );
    } finally {
      setSavingAnnouncement(false);
    }
  }

  async function saveOffersHero() {
    setSavingOffersHero(true);
    setErrorMessage("");

    try {
      if (!offersHero.title.trim()) {
        throw new Error("اكتب عنوان قسم العروض");
      }

      const { error } = await supabase
        .from("offers_hero_settings")
        .upsert(
          {
            id: 1,
            badge_text:
              offersHero.badge_text.trim() || null,
            title: offersHero.title.trim(),
            description:
              offersHero.description.trim() || null,
            primary_button_text:
              offersHero.primary_button_text.trim() ||
              "تسوق الآن",
            primary_button_link:
              offersHero.primary_button_link.trim() || "/",
            secondary_button_text:
              offersHero.secondary_button_text.trim() ||
              "اكتشف العروض",
            secondary_button_link:
              offersHero.secondary_button_link.trim() ||
              "#offers",
            is_visible: offersHero.is_visible,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) throw error;

      showMessage("تم حفظ واجهة العروض");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ واجهة العروض"
      );
    } finally {
      setSavingOffersHero(false);
    }
  }

  function chooseOfferTime(offerId: string) {
    setTimeOfferId(offerId);
    setErrorMessage("");

    const selectedOffer = offers.find(
      (offer) => offer.id === offerId
    );

    if (!selectedOffer) {
      setTimeStartsAt("");
      setTimeEndsAt("");
      return;
    }

    setTimeStartsAt(
      toDateTimeLocal(selectedOffer.starts_at)
    );
    setTimeEndsAt(
      toDateTimeLocal(selectedOffer.ends_at)
    );
  }

  async function saveOfferTime() {
    setErrorMessage("");

    if (!timeOfferId) {
      setErrorMessage("اختر اللعبة التي تريد تعديل وقتها");
      return;
    }

    if (!timeStartsAt) {
      setErrorMessage("حدد وقت بداية التخفيض");
      return;
    }

    if (!timeEndsAt) {
      setErrorMessage("حدد وقت نهاية التخفيض");
      return;
    }

    const startsAt = new Date(timeStartsAt);
    const endsAt = new Date(timeEndsAt);

    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime())
    ) {
      setErrorMessage("تأكد من كتابة وقت صحيح");
      return;
    }

    if (endsAt.getTime() <= startsAt.getTime()) {
      setErrorMessage("وقت النهاية يجب أن يكون بعد وقت البداية");
      return;
    }

    setSavingOfferTime(true);

    try {
      const { error } = await supabase
        .from("offers")
        .update({
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
        })
        .eq("id", timeOfferId);

      if (error) throw error;

      showMessage("تم حفظ وقت التخفيض للعبة المختارة");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ وقت التخفيض"
      );
    } finally {
      setSavingOfferTime(false);
    }
  }

  async function toggleDiscount(offer: OfferRow) {
    const { error } = await supabase
      .from("offers")
      .update({ is_active: !offer.is_active })
      .eq("id", offer.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadData();
  }

  async function deleteDiscount(offer: OfferRow) {
    if (!window.confirm("هل تريد حذف هذا التخفيض؟")) {
      return;
    }

    const { error } = await supabase
      .from("offers")
      .delete()
      .eq("id", offer.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تم حذف التخفيض");
    await loadData();
  }

  async function sendNotification() {
    setErrorMessage("");
    setMessage("");

    const title = notificationTitle.trim();
    const body = notificationBody.trim();

    if (!title) {
      setErrorMessage("اكتب موضوع الإشعار");
      return;
    }

    if (!body) {
      setErrorMessage("اكتب وصف الإشعار");
      return;
    }

    if (
      notificationAudience === "user" &&
      !notificationUserId
    ) {
      setErrorMessage("اختر المستخدم الذي سيستلم الإشعار");
      return;
    }

    setSendingNotification(true);

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          title,
          body,
          audience: notificationAudience,
          target_user_id:
            notificationAudience === "user"
              ? notificationUserId
              : null,
          is_active: true,
          created_by: user?.id ?? null,
        });

      if (error) throw error;

      setNotificationTitle("");
      setNotificationBody("");
      setNotificationAudience("all");
      setNotificationUserId("");
      setNotificationUserSearch("");

      showMessage(
        notificationAudience === "all"
          ? "تم إرسال الإشعار لكل المستخدمين"
          : "تم إرسال الإشعار للمستخدم المحدد"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر إرسال الإشعار"
      );
    } finally {
      setSendingNotification(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#08070d] text-white"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />

          <p className="mt-4 text-sm text-gray-400">
            جاري تحميل لوحة الإدارة...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized || !user) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-10 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-violet-700/10 blur-[130px]" />

        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-fuchsia-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-lg shadow-lg shadow-violet-950/30 sm:h-11 sm:w-11 sm:text-xl">
              ⚙️
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold text-violet-300 sm:text-[10px]">
                لوحة الإدارة
              </p>

              <h1 className="mt-1 truncate text-base font-black sm:text-lg">
                إدارة متجر ZETA
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              aria-label="تحديث البيانات"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg transition active:scale-95"
            >
              {refreshing ? "…" : "↻"}
            </button>

            <Link
              href="/"
              className="flex h-10 items-center rounded-2xl border border-white/10 bg-white/5 px-3 text-[10px] font-black text-gray-200 transition active:scale-95"
            >
              المتجر
            </Link>

            <button
              type="button"
              onClick={logout}
              className="hidden h-10 items-center rounded-2xl border border-red-400/15 bg-red-500/10 px-3 text-[10px] font-black text-red-300 transition active:scale-95 sm:flex"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[250px_1fr] lg:py-6">
        <aside className="h-fit rounded-[26px] border border-white/[0.07] bg-[#121019] p-3 lg:sticky lg:top-24">
          <div className="rounded-[20px] border border-violet-400/15 bg-violet-500/10 p-3">
            <p className="text-[9px] text-violet-300">
              مسجل كإداري
            </p>

            <h2 className="mt-1 truncate text-sm font-black">
              {adminName}
            </h2>

            <p
              dir="ltr"
              className="mt-1 truncate text-left text-[9px] text-gray-500"
            >
              {user.email}
            </p>
          </div>

          <nav className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <button
              type="button"
              onClick={() => setTab("users")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "users"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">👥</span>
              <span>المستخدمون</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("offers")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "offers"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">🏷️</span>
              <span>العروض</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("notifications")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "notifications"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">🔔</span>
              <span>الإشعارات</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("announcement")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "announcement"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">📢</span>
              <span>الشريط العلوي</span>
            </button>
          </nav>
        </aside>

        <div className="min-w-0">
          {errorMessage && (
            <div className="mb-4 rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              {errorMessage}

              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="mr-3 font-black text-white"
              >
                ×
              </button>
            </div>
          )}

          {tab === "users" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    إدارة الحسابات
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    المستخدمون
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    جميع الحسابات التي دخلت المتجر وطلباتها.
                  </p>
                </div>

                <div className="rounded-2xl bg-violet-500/10 px-3 py-2 text-center">
                  <p className="text-lg font-black text-violet-200">
                    {profiles.length}
                  </p>

                  <p className="text-[8px] text-gray-500">
                    مستخدم
                  </p>
                </div>
              </div>

              <div className="relative mt-5">
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-gray-500">
                  ⌕
                </span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث باسم المستخدم أو البريد أو رقم الجوال"
                  className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] py-4 pr-12 pl-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                />
              </div>

              <div className="mt-5 space-y-3">
                {filteredProfiles.map((profile) => {
                  const profileOrders = orders.filter(
                    (order) =>
                      order.user_id === profile.id
                  );

                  const paidTotal = profileOrders
                    .filter(
                      (order) =>
                        order.payment_status === "paid"
                    )
                    .reduce(
                      (total, order) =>
                        total + toNumber(order.total),
                      0
                    );

                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() =>
                        setSelectedProfile(profile)
                      }
                      className="flex w-full items-center gap-3 rounded-[22px] border border-white/[0.07] bg-black/20 p-3 text-right transition hover:border-violet-400/25 hover:bg-violet-500/[0.06] active:scale-[0.99] sm:p-4"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 text-lg font-black">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={
                              profile.display_name ||
                              "مستخدم"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (
                            profile.display_name ||
                            profile.email ||
                            "م"
                          ).charAt(0)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-black">
                            {profile.display_name ||
                              "بدون اسم"}
                          </h3>

                          {profile.is_blocked && (
                            <span className="shrink-0 rounded-full border border-red-400/20 bg-red-500/10 px-2 py-1 text-[7px] font-black text-red-300">
                              محظور
                            </span>
                          )}
                        </div>

                        <p
                          dir="ltr"
                          className="mt-1 truncate text-left text-[10px] text-gray-500"
                        >
                          {profile.email ||
                            profile.phone ||
                            "لا توجد بيانات اتصال"}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-[8px] text-gray-500">
                          <span>
                            {profileOrders.length} طلب
                          </span>

                          <span>•</span>

                          <span>
                            {formatMoney(paidTotal)}
                          </span>
                        </div>
                      </div>

                      <span className="shrink-0 text-lg text-gray-600">
                        ←
                      </span>
                    </button>
                  );
                })}

                {!filteredProfiles.length && (
                  <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                      🔍
                    </div>

                    <p className="mt-4 text-sm font-black">
                      لا توجد نتائج
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      جرّب كتابة اسم أو بريد مختلف.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "offers" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    إدارة محتوى المتجر
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    العروض
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    عدّل واجهة العروض وأنشئ تخفيضات مؤقتة على الألعاب.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                  🏷️
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-[20px] border border-white/10 bg-white/[0.03] p-1.5">
                <button
                  type="button"
                  onClick={() => setOffersInnerTab("content")}
                  className={`rounded-2xl px-4 py-3 text-xs font-black transition ${
                    offersInnerTab === "content"
                      ? "bg-violet-600 text-white"
                      : "text-gray-500"
                  }`}
                >
                  واجهة العروض
                </button>

                <button
                  type="button"
                  onClick={() => setOffersInnerTab("discounts")}
                  className={`rounded-2xl px-4 py-3 text-xs font-black transition ${
                    offersInnerTab === "discounts"
                      ? "bg-violet-600 text-white"
                      : "text-gray-500"
                  }`}
                >
                  التخفيضات
                </button>
              </div>

              {offersInnerTab === "content" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-[24px] border border-violet-400/20 bg-gradient-to-br from-violet-900/60 via-[#171128] to-fuchsia-900/30 p-5 text-center">
                    {offersHero.badge_text && (
                      <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200">
                        {offersHero.badge_text}
                      </span>
                    )}

                    <h3 className="mx-auto mt-4 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                      {offersHero.title}
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-gray-400">
                      {offersHero.description}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <span className="rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-3 text-xs font-black">
                        {offersHero.primary_button_text}
                      </span>

                      <span className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black">
                        {offersHero.secondary_button_text}
                      </span>
                    </div>
                  </div>

                  <AdminField label="العبارة الصغيرة">
                    <input
                      value={offersHero.badge_text}
                      onChange={(event) =>
                        setOffersHero((current) => ({
                          ...current,
                          badge_text: event.target.value,
                        }))
                      }
                      placeholder="عروض محدودة 🔥"
                      className={adminInputClass}
                    />
                  </AdminField>

                  <AdminField label="العنوان الكبير">
                    <input
                      value={offersHero.title}
                      onChange={(event) =>
                        setOffersHero((current) => ({
                          ...current,
                          title: event.target.value,
                        }))
                      }
                      placeholder="وفّر أكثر على ألعابك المفضلة"
                      className={adminInputClass}
                    />
                  </AdminField>

                  <AdminField label="الوصف">
                    <textarea
                      value={offersHero.description}
                      onChange={(event) =>
                        setOffersHero((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="مثال: اشترِ لعبتين واحصل على الثالثة مجانًا"
                      className={`${adminInputClass} resize-none leading-7`}
                    />
                  </AdminField>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField label="نص زر تسوق الآن">
                      <input
                        value={offersHero.primary_button_text}
                        onChange={(event) =>
                          setOffersHero((current) => ({
                            ...current,
                            primary_button_text: event.target.value,
                          }))
                        }
                        className={adminInputClass}
                      />
                    </AdminField>

                    <AdminField label="رابط زر تسوق الآن">
                      <input
                        dir="ltr"
                        value={offersHero.primary_button_link}
                        onChange={(event) =>
                          setOffersHero((current) => ({
                            ...current,
                            primary_button_link: event.target.value,
                          }))
                        }
                        className={`${adminInputClass} text-left`}
                      />
                    </AdminField>

                    <AdminField label="نص زر اكتشف العروض">
                      <input
                        value={offersHero.secondary_button_text}
                        onChange={(event) =>
                          setOffersHero((current) => ({
                            ...current,
                            secondary_button_text: event.target.value,
                          }))
                        }
                        className={adminInputClass}
                      />
                    </AdminField>

                    <AdminField label="رابط زر اكتشف العروض">
                      <input
                        dir="ltr"
                        value={offersHero.secondary_button_link}
                        onChange={(event) =>
                          setOffersHero((current) => ({
                            ...current,
                            secondary_button_link: event.target.value,
                          }))
                        }
                        className={`${adminInputClass} text-left`}
                      />
                    </AdminField>
                  </div>

                  <label className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <div>
                      <p className="text-sm font-black">
                        إظهار واجهة العروض
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        يمكنك إخفاء الجزء كاملًا من المتجر.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setOffersHero((current) => ({
                          ...current,
                          is_visible: !current.is_visible,
                        }))
                      }
                      className={`relative h-8 w-14 rounded-full transition ${
                        offersHero.is_visible
                          ? "bg-gradient-to-l from-violet-500 to-fuchsia-500"
                          : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                          offersHero.is_visible
                            ? "right-1"
                            : "right-7"
                        }`}
                      />
                    </button>
                  </label>

                  <button
                    type="button"
                    onClick={saveOffersHero}
                    disabled={savingOffersHero}
                    className="w-full rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black disabled:opacity-50"
                  >
                    {savingOffersHero
                      ? "جاري الحفظ..."
                      : "حفظ واجهة العروض"}
                  </button>
                </div>
              )}

              {offersInnerTab === "discounts" && (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-black">
                      تعديل وقت تخفيض لعبة
                    </h3>

                    <p className="mt-2 text-[10px] leading-5 text-gray-500">
                      اختر العرض الموجود ثم عدّل وقت البداية والنهاية فقط. لن تتغير نسبة الخصم أو اسم العرض.
                    </p>

                    <div className="mt-4 space-y-4">
                      <AdminField label="اختر اللعبة">
                        <select
                          value={timeOfferId}
                          onChange={(event) =>
                            chooseOfferTime(event.target.value)
                          }
                          className={adminInputClass}
                        >
                          <option value="">اختر لعبة</option>
                          {offers.map((offer) => {
                            const product = products.find(
                              (item) => item.id === offer.product_id
                            );

                            return (
                              <option key={offer.id} value={offer.id}>
                                {product?.name || "لعبة محذوفة"} — {offer.title}
                              </option>
                            );
                          })}
                        </select>
                      </AdminField>

                      {timeOfferId && (
                        <div className="rounded-[18px] border border-violet-400/15 bg-violet-500/[0.07] px-4 py-3">
                          {(() => {
                            const selectedOffer = offers.find(
                              (offer) => offer.id === timeOfferId
                            );
                            const product = products.find(
                              (item) =>
                                item.id === selectedOffer?.product_id
                            );

                            if (!selectedOffer) return null;

                            return (
                              <>
                                <p className="text-xs font-black text-violet-200">
                                  {product?.name || "لعبة محذوفة"}
                                </p>
                                <p className="mt-1 text-[9px] text-gray-500">
                                  {selectedOffer.discount_type === "percentage"
                                    ? `خصم ${selectedOffer.discount_value}%`
                                    : `خصم ${formatMoney(
                                        selectedOffer.discount_value
                                      )}`}
                                  {" • "}
                                  {selectedOffer.is_active
                                    ? "مفعّل"
                                    : "متوقف"}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <AdminField label="بداية التخفيض">
                          <input
                            type="datetime-local"
                            value={timeStartsAt}
                            onChange={(event) =>
                              setTimeStartsAt(event.target.value)
                            }
                            disabled={!timeOfferId}
                            className={`${adminInputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </AdminField>

                        <AdminField label="نهاية التخفيض">
                          <input
                            type="datetime-local"
                            value={timeEndsAt}
                            onChange={(event) =>
                              setTimeEndsAt(event.target.value)
                            }
                            disabled={!timeOfferId}
                            className={`${adminInputClass} disabled:cursor-not-allowed disabled:opacity-40`}
                          />
                        </AdminField>
                      </div>

                      <button
                        type="button"
                        onClick={saveOfferTime}
                        disabled={!timeOfferId || savingOfferTime}
                        className="w-full rounded-[20px] bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-4 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingOfferTime
                          ? "جاري حفظ الوقت..."
                          : "حفظ وقت التخفيض"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black">
                        التخفيضات الحالية
                      </h3>
                      <span className="text-[10px] text-gray-500">
                        {offers.length} تخفيض
                      </span>
                    </div>

                    <div className="space-y-3">
                      {offers.map((offer) => {
                        const product = products.find(
                          (item) => item.id === offer.product_id
                        );

                        return (
                          <div
                            key={offer.id}
                            className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black">
                                  {offer.title}
                                </p>
                                <p className="mt-1 text-[10px] text-gray-500">
                                  {product?.name || "لعبة محذوفة"}
                                </p>
                                <p className="mt-2 text-[10px] text-gray-500">
                                  {offer.discount_type === "percentage"
                                    ? `خصم ${offer.discount_value}%`
                                    : `خصم ${formatMoney(
                                        offer.discount_value
                                      )}`}
                                  {" • "}
                                  ينتهي {formatDate(offer.ends_at)}
                                </p>
                              </div>

                              <span
                                className={`rounded-full px-2 py-1 text-[8px] font-black ${
                                  offer.is_active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-300"
                                }`}
                              >
                                {offer.is_active
                                  ? "مفعّل"
                                  : "متوقف"}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => toggleDiscount(offer)}
                                className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-[10px] font-black text-violet-200"
                              >
                                {offer.is_active
                                  ? "إيقاف"
                                  : "تشغيل"}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteDiscount(offer)}
                                className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-[10px] font-black text-red-300"
                              >
                                حذف
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {!offers.length && (
                        <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-xs text-gray-500">
                          لا توجد تخفيضات حتى الآن.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "notifications" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    التواصل مع العملاء
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    إنشاء إشعار
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    أرسل إشعارًا لكل المستخدمين أو لمستخدم محدد.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                  🔔
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black text-gray-300">
                    موضوع الإشعار
                  </span>

                  <input
                    value={notificationTitle}
                    onChange={(event) =>
                      setNotificationTitle(event.target.value)
                    }
                    placeholder="مثال: وصل عرض جديد"
                    maxLength={120}
                    className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black text-gray-300">
                    وصف الإشعار
                  </span>

                  <textarea
                    value={notificationBody}
                    onChange={(event) =>
                      setNotificationBody(event.target.value)
                    }
                    rows={5}
                    placeholder="اكتب تفاصيل الإشعار التي ستظهر للمستخدم"
                    maxLength={1000}
                    className="w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                  />
                </label>

                <div>
                  <span className="mb-2 block text-xs font-black text-gray-300">
                    إرسال إلى
                  </span>

                  <div className="grid grid-cols-2 gap-2 rounded-[20px] border border-white/10 bg-white/[0.03] p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setNotificationAudience("all");
                        setNotificationUserId("");
                        setNotificationUserSearch("");
                      }}
                      className={`rounded-2xl px-4 py-3 text-xs font-black transition ${
                        notificationAudience === "all"
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                          : "text-gray-500"
                      }`}
                    >
                      كل المستخدمين
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNotificationAudience("user")
                      }
                      className={`rounded-2xl px-4 py-3 text-xs font-black transition ${
                        notificationAudience === "user"
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                          : "text-gray-500"
                      }`}
                    >
                      مستخدم محدد
                    </button>
                  </div>
                </div>

                {notificationAudience === "user" && (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-black text-gray-300">
                        ابحث عن المستخدم
                      </span>

                      <input
                        type="search"
                        value={notificationUserSearch}
                        onChange={(event) =>
                          setNotificationUserSearch(
                            event.target.value
                          )
                        }
                        placeholder="اكتب الاسم أو البريد أو رقم الجوال"
                        className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                      />
                    </label>

                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-[20px] border border-white/10 bg-white/[0.03] p-2">
                      {filteredNotificationUsers.map(
                        (profile) => (
                          <button
                            key={profile.id}
                            type="button"
                            onClick={() =>
                              setNotificationUserId(
                                profile.id
                              )
                            }
                            className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-right transition ${
                              notificationUserId ===
                              profile.id
                                ? "bg-violet-500/15 text-violet-200"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-500/10 text-sm font-black">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={
                                    profile.display_name ||
                                    "مستخدم"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                (
                                  profile.display_name ||
                                  profile.email ||
                                  "م"
                                ).charAt(0)
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-black">
                                {profile.display_name ||
                                  "بدون اسم"}
                              </p>

                              <p
                                dir="ltr"
                                className="mt-1 truncate text-left text-[9px] text-gray-500"
                              >
                                {profile.email ||
                                  profile.phone ||
                                  "—"}
                              </p>
                            </div>

                            {notificationUserId ===
                              profile.id && (
                              <span className="text-violet-300">
                                ✓
                              </span>
                            )}
                          </button>
                        )
                      )}

                      {!filteredNotificationUsers.length && (
                        <div className="px-4 py-8 text-center text-xs text-gray-500">
                          لا يوجد مستخدم بهذا الاسم.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={sendNotification}
                  disabled={sendingNotification}
                  className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sendingNotification
                    ? "جاري إرسال الإشعار..."
                    : "إرسال الإشعار"}
                </button>
              </div>
            </section>
          )}

          {tab === "announcement" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    إعدادات المتجر
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    الشريط العلوي
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    عدّل النص أو أخفِ الشريط من المتجر.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                  📢
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-violet-400/20 bg-gradient-to-l from-violet-600/25 via-fuchsia-500/20 to-violet-600/25 px-4 py-3 text-center">
                {announcement.is_visible ? (
                  <p className="text-sm font-black text-white">
                    {announcement.emoji && (
                      <span className="ml-2">
                        {announcement.emoji}
                      </span>
                    )}

                    {announcement.text ||
                      "معاينة الشريط العلوي"}
                  </p>
                ) : (
                  <p className="text-xs font-black text-gray-400">
                    الشريط مخفي حاليًا
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-black text-gray-300">
                    النص داخل الشريط
                  </span>

                  <textarea
                    value={announcement.text}
                    onChange={(event) =>
                      setAnnouncement((current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-violet-400/50"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black text-gray-300">
                      الإيموجي
                    </span>

                    <input
                      value={
                        announcement.emoji || ""
                      }
                      onChange={(event) =>
                        setAnnouncement((current) => ({
                          ...current,
                          emoji: event.target.value,
                        }))
                      }
                      maxLength={8}
                      className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition focus:border-violet-400/50"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black text-gray-300">
                      الرابط عند الضغط
                    </span>

                    <input
                      dir="ltr"
                      value={
                        announcement.link_url || ""
                      }
                      onChange={(event) =>
                        setAnnouncement((current) => ({
                          ...current,
                          link_url:
                            event.target.value,
                        }))
                      }
                      placeholder="/offers"
                      className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-left text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50"
                    />
                  </label>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div>
                    <p className="text-sm font-black">
                      إظهار الشريط العلوي
                    </p>

                    <p className="mt-1 text-[10px] text-gray-500">
                      عطّل الخيار لإخفائه من المتجر.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={
                      announcement.is_visible
                    }
                    onClick={() =>
                      setAnnouncement((current) => ({
                        ...current,
                        is_visible:
                          !current.is_visible,
                      }))
                    }
                    className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                      announcement.is_visible
                        ? "bg-gradient-to-l from-violet-500 to-fuchsia-500"
                        : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition ${
                        announcement.is_visible
                          ? "right-1"
                          : "right-7"
                      }`}
                    />
                  </button>
                </label>

                <button
                  type="button"
                  onClick={saveAnnouncement}
                  disabled={savingAnnouncement}
                  className="flex w-full items-center justify-center rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/35 transition active:scale-[0.98] disabled:opacity-50"
                >
                  {savingAnnouncement
                    ? "جاري الحفظ..."
                    : "حفظ الشريط العلوي"}
                </button>
              </div>
            </section>
          )}
        </div>
      </section>

      {selectedProfile && !selectedOrder && (
        <Modal
          title="بيانات المستخدم"
          onClose={() =>
            setSelectedProfile(null)
          }
        >
          <div className="flex items-center gap-4 rounded-[22px] border border-violet-400/15 bg-violet-500/[0.07] p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-black">
              {selectedProfile.avatar_url ? (
                <img
                  src={selectedProfile.avatar_url}
                  alt={
                    selectedProfile.display_name ||
                    "مستخدم"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                (
                  selectedProfile.display_name ||
                  selectedProfile.email ||
                  "م"
                ).charAt(0)
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black">
                {selectedProfile.display_name ||
                  "بدون اسم"}
              </h3>

              <p
                dir="ltr"
                className="mt-1 truncate text-left text-xs text-gray-500"
              >
                {selectedProfile.email || "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoCard
              label="رقم الجوال"
              value={selectedProfile.phone || "—"}
            />

            <InfoCard
              label="حالة الحساب"
              value={
                selectedProfile.is_blocked
                  ? "محظور"
                  : "نشط"
              }
            />

            <InfoCard
              label="تاريخ التسجيل"
              value={formatDate(
                selectedProfile.created_at
              )}
            />

            <InfoCard
              label="آخر دخول"
              value={formatDate(
                selectedProfile.last_sign_in_at
              )}
            />

            <InfoCard
              label="عدد الطلبات"
              value={String(
                selectedProfileOrders.length
              )}
            />

            <InfoCard
              label="إجمالي المدفوع"
              value={formatMoney(
                selectedProfilePaidTotal
              )}
            />
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black">
                طلبات المستخدم
              </h3>

              <span className="text-[10px] text-gray-500">
                {selectedProfileOrders.length} طلب
              </span>
            </div>

            <div className="space-y-3">
              {selectedProfileOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() =>
                    setSelectedOrder(order)
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-3 text-right transition hover:border-violet-400/25"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black">
                      {order.order_number}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="shrink-0 text-left">
                    <p className="text-xs font-black">
                      {formatMoney(order.total)}
                    </p>

                    <span
                      className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[7px] font-black ${statusClass[order.status]}`}
                    >
                      {statusLabel[order.status]}
                    </span>
                  </div>
                </button>
              ))}

              {!selectedProfileOrders.length && (
                <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
                  هذا المستخدم لم يطلب أي شيء حتى الآن.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {selectedOrder && (
        <Modal
          title={`تفاصيل الطلب ${selectedOrder.order_number}`}
          onClose={() =>
            setSelectedOrder(null)
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="حالة الطلب"
              value={
                statusLabel[selectedOrder.status]
              }
            />

            <InfoCard
              label="حالة الدفع"
              value={
                paymentStatusLabel[
                  selectedOrder.payment_status
                ]
              }
            />

            <InfoCard
              label="طريقة الدفع"
              value={
                selectedOrder.payment_method
                  ? paymentMethodLabel[
                      selectedOrder.payment_method
                    ] ||
                    selectedOrder.payment_method
                  : "—"
              }
            />

            <InfoCard
              label="الإجمالي"
              value={formatMoney(
                selectedOrder.total
              )}
            />

            <InfoCard
              label="تاريخ الطلب"
              value={formatDate(
                selectedOrder.created_at
              )}
            />

            <InfoCard
              label="وقت الدفع"
              value={formatDate(
                selectedOrder.paid_at
              )}
            />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-black">
              محتويات الطلب
            </h3>

            <div className="space-y-3">
              {(selectedOrder.order_items ?? []).map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black">
                        {item.item_name}
                      </p>

                      <p className="mt-1 text-[9px] text-gray-500">
                        الكمية: {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-black">
                      {formatMoney(
                        item.total_price
                      )}
                    </p>
                  </div>
                )
              )}

              {!selectedOrder.order_items?.length && (
                <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
                  لا توجد عناصر مسجلة داخل الطلب.
                </div>
              )}
            </div>
          </div>

          {(selectedOrder.payments ?? []).map(
            (payment) => (
              <div
                key={payment.id}
                className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-4"
              >
                <h3 className="text-xs font-black">
                  معلومات عملية الدفع
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <InfoCard
                    label="رقم العملية"
                    value={
                      payment.transaction_id ||
                      "—"
                    }
                  />

                  <InfoCard
                    label="بوابة الدفع"
                    value={
                      payment.provider || "—"
                    }
                  />

                  <InfoCard
                    label="حالة العملية"
                    value={
                      paymentStatusLabel[
                        payment.status
                      ]
                    }
                  />

                  <InfoCard
                    label="وقت الدفع"
                    value={formatDate(
                      payment.paid_at
                    )}
                  />
                </div>
              </div>
            )
          )}

          {selectedOrder.cancellation_reason && (
            <ReasonBox
              title="سبب الإلغاء"
              value={
                selectedOrder.cancellation_reason
              }
            />
          )}

          {selectedOrder.rejection_reason && (
            <ReasonBox
              title="سبب الرفض"
              value={
                selectedOrder.rejection_reason
              }
            />
          )}
        </Modal>
      )}

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[300] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-emerald-400/15 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}
    </main>
  );
}

const adminInputClass =
  "w-full rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-400/50";

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0"
      />

      <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] border border-white/10 bg-[#121019] p-4 shadow-2xl sm:rounded-[30px] sm:p-5">
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-[#121019] pb-3">
          <h2 className="text-lg font-black">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl"
          >
            ×
          </button>
        </div>

        {children}
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[9px] text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-black">
        {value}
      </p>
    </div>
  );
}

function ReasonBox({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-500/10 p-4">
      <p className="text-[10px] font-black text-red-300">
        {title}
      </p>

      <p className="mt-2 text-xs leading-6 text-red-100">
        {value}
      </p>
    </div>
  );
}