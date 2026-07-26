"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AdminTab =
  | "overview"
  | "users"
  | "games"
  | "home"
  | "notifications"
  | "offers"
  | "discountCodes"
  | "announcement";

type AnnouncementBar = {
  id: number;
  text: string;
  emoji: string | null;
  link_url: string | null;
  is_visible: boolean;
};

type ProductOption = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  cover_url: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  platform: string;
  is_shared: boolean;
  is_featured: boolean;
  is_best_seller_manual: boolean;
  is_active: boolean;
  sold_count: number;
  display_kind: "featured" | "shared" | "private";
  card_badge: string | null;
  detail_category_label: string | null;
  delivery_text: string | null;
  ownership_text: string | null;
  usage_text: string | null;
  discount_percent: number | null;
};

type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  title: string;
  sort_order: number;
};

type PackageOption = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
};

type HomeSourceOption = {
  id: string;
  name: string;
  price: number;
};

type HomeSectionKey =
  | "featured"
  | "shared"
  | "private"
  | "packages";

type HomeCategory = {
  id: string;
  name: string;
  icon: string;
  slug: string | null;
  link_url: string | null;
  page_badge: string;
  page_title: string;
  page_description: string;
  games_badge: string;
  games_title: string;
  empty_title: string;
  empty_description: string;
  use_custom_items: boolean;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
};

type HomeCategoryItem = {
  id: string;
  category_id: string;
  product_id: string | null;
  package_id: string | null;
  sort_order: number;
  is_active: boolean;
};

type HomePageItem = {
  id: string;
  section_key: HomeSectionKey;
  product_id: string | null;
  package_id: string | null;
  sort_order: number;
  is_active: boolean;
};

type OfferRow = {
  id: string;
  title: string;
  product_id: string | null;
  offer_category_id: string | null;
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
};

type OfferCategory = {
  id: string;
  name: string;
  slug: string;
  filter_key: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
};

type DiscountCodeRow = {
  id: string;
  code: string;
  discount_percent: number;
  applies_to_all: boolean;
  is_active: boolean;
  created_at: string;
};

type DiscountCodeProductRow = {
  id: string;
  discount_code_id: string;
  product_id: string;
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
  discount_code: string | null;
  discount_percent: number | null;
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

type SitePresenceRow = {
  session_id: string;
  user_id: string | null;
  display_name: string | null;
  current_path: string | null;
  first_seen_at: string;
  last_seen_at: string;
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
  title: "وفر أكثر على ألعابك المفضلة",
  description:
    "مجموعة من أفضل الخصومات المتاحة حاليًا داخل متجر ZETA.",
};

const homeSectionLabel: Record<HomeSectionKey, string> = {
  featured: "ألعاب مميزة",
  shared: "ألعاب PC مشتركة",
  private: "ألعاب PC خاصة",
  packages: "بكجات الألعاب",
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

function getDatabaseErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "تعذر حفظ كود الخصم";
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

  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<AdminTab>("overview");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [sitePresence, setSitePresence] = useState<SitePresenceRow[]>([]);
  const [visitsToday, setVisitsToday] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatus | "all">("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
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
  const [productImages, setProductImages] = useState<ProductImageRow[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [homeProducts, setHomeProducts] = useState<HomeSourceOption[]>([]);
  const [homePackages, setHomePackages] = useState<HomeSourceOption[]>([]);
  const [loadingHomeSources, setLoadingHomeSources] = useState(false);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOption | null>(null);
  const [productName, setProductName] = useState("");
  const [productPlatform, setProductPlatform] = useState("PC");
  const [productDetailCategory, setProductDetailCategory] = useState("");
  const [productCardBadge, setProductCardBadge] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  const [productDiscountPercent, setProductDiscountPercent] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productOwnership, setProductOwnership] = useState("");
  const [productUsage, setProductUsage] = useState("");
  const [productSoldCount, setProductSoldCount] = useState("0");
  const [productStock, setProductStock] = useState("0");
  const [productDisplayKind, setProductDisplayKind] =
    useState<"featured" | "shared" | "private">("featured");
  const [productHomeSection, setProductHomeSection] =
    useState<"" | "featured" | "shared" | "private">("");
  const [productCategoryIds, setProductCategoryIds] = useState<string[]>([]);
  const [productActive, setProductActive] = useState(true);
  const [productNewImages, setProductNewImages] = useState<File[]>([]);
  const [productNewImagePreviews, setProductNewImagePreviews] =
    useState<string[]>([]);
  const [editingProductImages, setEditingProductImages] =
    useState<ProductImageRow[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [homeCategories, setHomeCategories] =
    useState<HomeCategory[]>([]);
  const [homeCategoryItems, setHomeCategoryItems] =
    useState<HomeCategoryItem[]>([]);
  const [homePageItems, setHomePageItems] =
    useState<HomePageItem[]>([]);
  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [offerCategories, setOfferCategories] =
    useState<OfferCategory[]>([]);
  const [offersHero, setOffersHero] =
    useState<OffersHeroSettings>(defaultOffersHero);
  const [offersInnerTab, setOffersInnerTab] =
    useState<"content" | "discounts">("content");
  const [savingOffersHero, setSavingOffersHero] = useState(false);

  const [discountCodes, setDiscountCodes] = useState<DiscountCodeRow[]>([]);
  const [discountCodeProducts, setDiscountCodeProducts] =
    useState<DiscountCodeProductRow[]>([]);
  const [editingDiscountCodeId, setEditingDiscountCodeId] =
    useState<string | null>(null);
  const [discountCodeText, setDiscountCodeText] = useState("");
  const [discountCodePercent, setDiscountCodePercent] = useState("");
  const [discountCodeAppliesToAll, setDiscountCodeAppliesToAll] =
    useState(false);
  const [discountCodeActive, setDiscountCodeActive] = useState(true);
  const [discountCodeProductIds, setDiscountCodeProductIds] =
    useState<string[]>([]);
  const [savingDiscountCode, setSavingDiscountCode] = useState(false);

  const [homeCategoryName, setHomeCategoryName] = useState("");
  const [homeCategoryIcon, setHomeCategoryIcon] = useState("🎮");
  const [homeCategorySlug, setHomeCategorySlug] = useState("");
  const [editingHomeCategoryId, setEditingHomeCategoryId] =
    useState<string | null>(null);
  const [savingHomeCategory, setSavingHomeCategory] = useState(false);

  const [selectedHomeCategoryId, setSelectedHomeCategoryId] =
    useState("");
  const [homePageBadge, setHomePageBadge] =
    useState("التصنيف المختار");
  const [homePageTitle, setHomePageTitle] = useState("");
  const [homePageDescription, setHomePageDescription] = useState("");
  const [homeGamesBadge, setHomeGamesBadge] = useState("الألعاب");
  const [homeGamesTitle, setHomeGamesTitle] = useState("");
  const [homeEmptyTitle, setHomeEmptyTitle] =
    useState("لا توجد ألعاب حاليًا");
  const [homeEmptyDescription, setHomeEmptyDescription] =
    useState("سيتم إضافة ألعاب جديدة قريبًا");
  const [savingHomeCategoryPage, setSavingHomeCategoryPage] =
    useState(false);
  const [homeCategorySourceType, setHomeCategorySourceType] =
    useState<"product" | "package">("product");
  const [homeCategorySourceId, setHomeCategorySourceId] =
    useState("");
  const [savingHomeCategoryItem, setSavingHomeCategoryItem] =
    useState(false);

  const [homeSectionKey, setHomeSectionKey] =
    useState<HomeSectionKey>("featured");
  const [homeSourceId, setHomeSourceId] = useState("");
  const [savingHomeItem, setSavingHomeItem] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);

  const [selectedOfferCategoryProductId, setSelectedOfferCategoryProductId] =
    useState("");
  const [selectedOfferCategoryId, setSelectedOfferCategoryId] =
    useState("");
  const [savingOfferCategoryAssignment, setSavingOfferCategoryAssignment] =
    useState(false);

  const [selectedDiscountProductId, setSelectedDiscountProductId] =
    useState("");
  const [offerEndsAt, setOfferEndsAt] = useState("");
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

  const overviewStats = useMemo(() => {
    const saleOrders = orders.filter(
      (order) =>
        order.payment_status === "paid" &&
        !["cancelled", "refunded", "rejected"].includes(order.status)
    );

    return {
      totalSales: saleOrders.reduce(
        (total, order) => total + toNumber(order.total),
        0
      ),
      processing: orders.filter((order) => order.status === "processing").length,
      completed: orders.filter((order) => order.status === "completed").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
      pending: orders.filter((order) =>
        ["pending", "paid"].includes(order.status)
      ).length,
    };
  }, [orders]);

  const filteredOverviewOrders = useMemo(() => {
    if (orderStatusFilter === "all") return orders;

    return orders.filter((order) => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const homeSourceOptions = useMemo(() => {
    return homeSectionKey === "packages" ? homePackages : homeProducts;
  }, [homeSectionKey, homePackages, homeProducts]);

  const homeCategorySourceOptions = useMemo(() => {
    return homeCategorySourceType === "package"
      ? homePackages
      : homeProducts;
  }, [homeCategorySourceType, homePackages, homeProducts]);

  const selectedHomeCategoryItems = useMemo(() => {
    return homeCategoryItems
      .filter((item) => item.category_id === selectedHomeCategoryId)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [homeCategoryItems, selectedHomeCategoryId]);

  useEffect(() => {
    const category = homeCategories.find(
      (item) => item.id === selectedHomeCategoryId
    );

    if (!category) {
      setHomePageBadge("التصنيف المختار");
      setHomePageTitle("");
      setHomePageDescription("");
      setHomeGamesBadge("الألعاب");
      setHomeGamesTitle("");
      setHomeEmptyTitle("لا توجد ألعاب حاليًا");
      setHomeEmptyDescription("سيتم إضافة ألعاب جديدة قريبًا");
      return;
    }

    setHomePageBadge(category.page_badge || "التصنيف المختار");
    setHomePageTitle(category.page_title || category.name);
    setHomePageDescription(
      category.page_description || "الألعاب الموجودة في هذا التصنيف"
    );
    setHomeGamesBadge(category.games_badge || "الألعاب");
    setHomeGamesTitle(
      category.games_title || category.page_title || category.name
    );
    setHomeEmptyTitle(category.empty_title || "لا توجد ألعاب حاليًا");
    setHomeEmptyDescription(
      category.empty_description || "سيتم إضافة ألعاب جديدة قريبًا"
    );
  }, [homeCategories, selectedHomeCategoryId]);

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

  async function loadHomeSourceOptions() {
    setLoadingHomeSources(true);

    try {
      const [productsResult, packagesResult] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, price")
          .order("name", { ascending: true }),

        supabase
          .from("packages")
          .select("id, name, price")
          .order("name", { ascending: true }),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (packagesResult.error) throw packagesResult.error;

      setHomeProducts(
        (productsResult.data ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          price: toNumber(product.price),
        }))
      );

      setHomePackages(
        (packagesResult.data ?? []).map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          price: toNumber(pkg.price),
        }))
      );
    } catch (error) {
      console.error(
        "تعذر تحميل الألعاب والبكجات لقوائم الصفحة الرئيسية:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل الألعاب والبكجات"
      );
    } finally {
      setLoadingHomeSources(false);
    }
  }

  async function loadPresence() {
    try {
      const onlineThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [onlineResult, todayResult] = await Promise.all([
        supabase
          .from("site_presence")
          .select(
            "session_id, user_id, display_name, current_path, first_seen_at, last_seen_at"
          )
          .gte("last_seen_at", onlineThreshold)
          .order("last_seen_at", { ascending: false }),

        supabase
          .from("site_presence")
          .select("session_id", { count: "exact", head: true })
          .gte("last_seen_at", startOfToday.toISOString()),
      ]);

      if (onlineResult.error) throw onlineResult.error;
      if (todayResult.error) throw todayResult.error;

      setSitePresence((onlineResult.data ?? []) as SitePresenceRow[]);
      setVisitsToday(todayResult.count ?? 0);
    } catch (error) {
      console.error("تعذر تحميل المتصلين الآن:", error);
    }
  }

  async function loadData() {
    setRefreshing(true);
    setErrorMessage("");

    try {
      const [
        profilesResult,
        ordersResult,
        announcementResult,
        productsResult,
        productImagesResult,
        packagesResult,
        offersResult,
        offersHeroResult,
        offerCategoriesResult,
        homeCategoriesResult,
        homeCategoryItemsResult,
        homePageItemsResult,
        discountCodesResult,
        discountCodeProductsResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, display_name, email, phone, avatar_url, is_blocked, last_sign_in_at, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("orders")
          .select("*, order_items(*), payments(*)")
          .order("created_at", { ascending: false }),

        supabase
          .from("announcement_bar")
          .select("id, text, emoji, link_url, is_visible")
          .eq("id", 1)
          .maybeSingle(),

        supabase
          .from("products")
          .select(
            "id, category_id, name, slug, short_description, description, cover_url, price, old_price, stock, platform, is_shared, is_featured, is_best_seller_manual, is_active, sold_count, display_kind, card_badge, detail_category_label, delivery_text, ownership_text, usage_text, discount_percent"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("product_images")
          .select("id, product_id, image_url, title, sort_order")
          .order("product_id", { ascending: true })
          .order("sort_order", { ascending: true }),

        supabase
          .from("packages")
          .select("id, name, price, image_url")
          .order("name", { ascending: true }),

        supabase
          .from("offers")
          .select(
            "id, title, product_id, offer_category_id, discount_type, discount_value, starts_at, ends_at, is_active"
          )
          .not("product_id", "is", null)
          .order("created_at", { ascending: false }),

        supabase
          .from("offers_hero_settings")
          .select("id, badge_text, title, description")
          .eq("id", 1)
          .maybeSingle(),

        supabase
          .from("offer_categories")
          .select("*")
          .order("sort_order", { ascending: true }),

        supabase
          .from("home_categories")
          .select(
            "id, name, icon, slug, link_url, page_badge, page_title, page_description, games_badge, games_title, empty_title, empty_description, use_custom_items, sort_order, is_active, is_system"
          )
          .order("sort_order", { ascending: true }),

        supabase
          .from("home_category_items")
          .select(
            "id, category_id, product_id, package_id, sort_order, is_active"
          )
          .order("category_id", { ascending: true })
          .order("sort_order", { ascending: true }),

        supabase
          .from("home_page_items")
          .select(
            "id, section_key, product_id, package_id, sort_order, is_active"
          )
          .order("section_key", { ascending: true })
          .order("sort_order", { ascending: true }),

        supabase
          .from("discount_codes")
          .select(
            "id, code, discount_percent, applies_to_all, is_active, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("discount_code_products")
          .select("id, discount_code_id, product_id")
          .order("created_at", { ascending: true }),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (ordersResult.error) throw ordersResult.error;
      if (announcementResult.error) throw announcementResult.error;
      if (productsResult.error) throw productsResult.error;
      if (productImagesResult.error) throw productImagesResult.error;
      if (packagesResult.error) throw packagesResult.error;
      if (offersResult.error) throw offersResult.error;
      if (offersHeroResult.error) throw offersHeroResult.error;
      if (offerCategoriesResult.error) throw offerCategoriesResult.error;
      if (homeCategoriesResult.error) throw homeCategoriesResult.error;
      if (homeCategoryItemsResult.error) throw homeCategoryItemsResult.error;
      if (homePageItemsResult.error) throw homePageItemsResult.error;
      if (discountCodesResult.error) throw discountCodesResult.error;
      if (discountCodeProductsResult.error)
        throw discountCodeProductsResult.error;

      setProfiles((profilesResult.data ?? []) as Profile[]);
      setOrders((ordersResult.data ?? []) as UserOrder[]);

      if (announcementResult.data) {
        setAnnouncement({
          id: 1,
          text: announcementResult.data.text ?? "",
          emoji: announcementResult.data.emoji ?? "",
          link_url: announcementResult.data.link_url ?? "",
          is_visible: Boolean(
            announcementResult.data.is_visible
          ),
        });
      }

      setProducts(
        (productsResult.data ?? []).map((product) => ({
          id: product.id,
          category_id: product.category_id ?? null,
          name: product.name,
          slug: product.slug ?? product.id,
          short_description: product.short_description ?? null,
          description: product.description ?? null,
          cover_url: product.cover_url ?? null,
          price: toNumber(product.price),
          old_price:
            product.old_price === null || product.old_price === undefined
              ? null
              : toNumber(product.old_price),
          stock: Math.max(0, Math.floor(toNumber(product.stock))),
          platform: product.platform || "PC",
          is_shared: Boolean(product.is_shared),
          is_featured: Boolean(product.is_featured),
          is_best_seller_manual: Boolean(product.is_best_seller_manual),
          is_active: Boolean(product.is_active),
          sold_count: Math.max(0, Math.floor(toNumber(product.sold_count))),
          display_kind:
            product.display_kind === "shared" ||
            product.display_kind === "private"
              ? product.display_kind
              : "featured",
          card_badge: product.card_badge ?? null,
          detail_category_label: product.detail_category_label ?? null,
          delivery_text: product.delivery_text ?? null,
          ownership_text: product.ownership_text ?? null,
          usage_text: product.usage_text ?? null,
          discount_percent:
            product.discount_percent === null ||
            product.discount_percent === undefined
              ? null
              : toNumber(product.discount_percent),
        }))
      );

      setProductImages(
        (productImagesResult.data ?? []).map((image) => ({
          id: image.id,
          product_id: image.product_id,
          image_url: image.image_url,
          title: image.title || "صورة اللعبة",
          sort_order: Number(image.sort_order ?? 0),
        }))
      );

      setPackages(
        (packagesResult.data ?? []).map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          price: toNumber(pkg.price),
          image_url: pkg.image_url ?? null,
        }))
      );

      setHomeProducts(
        (productsResult.data ?? []).map((product) => ({
          id: product.id,
          name: product.name,
          price: toNumber(product.price),
        }))
      );

      setHomePackages(
        (packagesResult.data ?? []).map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          price: toNumber(pkg.price),
        }))
      );

      const loadedHomeCategories =
        (homeCategoriesResult.data ?? []).map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon || "🎮",
          slug: category.slug ?? null,
          link_url: category.link_url ?? null,
          page_badge: category.page_badge || "التصنيف المختار",
          page_title: category.page_title || category.name,
          page_description:
            category.page_description ||
            "الألعاب الموجودة في هذا التصنيف",
          games_badge: category.games_badge || "الألعاب",
          games_title: category.games_title || category.page_title || category.name,
          empty_title: category.empty_title || "لا توجد ألعاب حاليًا",
          empty_description:
            category.empty_description ||
            "سيتم إضافة ألعاب جديدة قريبًا",
          use_custom_items: Boolean(category.use_custom_items),
          sort_order: Number(category.sort_order ?? 0),
          is_active: Boolean(category.is_active),
          is_system: Boolean(category.is_system),
        })) as HomeCategory[];

      setHomeCategories(loadedHomeCategories);
      setSelectedHomeCategoryId((current) => {
        const validCurrent = loadedHomeCategories.some(
          (category) => category.id === current && category.slug
        );

        return validCurrent
          ? current
          : loadedHomeCategories.find((category) => category.slug)?.id || "";
      });

      setHomeCategoryItems(
        (homeCategoryItemsResult.data ?? []).map((item) => ({
          id: item.id,
          category_id: item.category_id,
          product_id: item.product_id ?? null,
          package_id: item.package_id ?? null,
          sort_order: Number(item.sort_order ?? 0),
          is_active: Boolean(item.is_active),
        }))
      );

      setHomePageItems(
        (homePageItemsResult.data ?? []).map((item) => ({
          id: item.id,
          section_key: item.section_key as HomeSectionKey,
          product_id: item.product_id ?? null,
          package_id: item.package_id ?? null,
          sort_order: Number(item.sort_order ?? 0),
          is_active: Boolean(item.is_active),
        }))
      );

      setDiscountCodes(
        (discountCodesResult.data ?? []).map((item) => ({
          id: item.id,
          code: item.code,
          discount_percent: toNumber(item.discount_percent),
          applies_to_all: Boolean(item.applies_to_all),
          is_active: Boolean(item.is_active),
          created_at: item.created_at,
        }))
      );

      setDiscountCodeProducts(
        (discountCodeProductsResult.data ?? []).map((item) => ({
          id: item.id,
          discount_code_id: item.discount_code_id,
          product_id: item.product_id,
        }))
      );

      setOffers(
        (offersResult.data ?? []).map((offer) => ({
          id: offer.id,
          title: offer.title,
          product_id: offer.product_id,
          offer_category_id: offer.offer_category_id ?? null,
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
        });
      }

      setOfferCategories(
        (offerCategoriesResult.data ?? []) as OfferCategory[]
      );
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


  useEffect(() => {
    if (
      authorized &&
      tab === "offers" &&
      offersInnerTab === "discounts"
    ) {
      void loadData();
    }
  }, [authorized, tab, offersInnerTab]);

  useEffect(() => {
    if (authorized && tab === "home") {
      void loadHomeSourceOptions();
    }
  }, [authorized, tab]);

  useEffect(() => {
    if (!authorized || tab !== "overview") return;

    void loadPresence();
    const timer = window.setInterval(() => {
      void loadPresence();
    }, 30000);

    return () => window.clearInterval(timer);
  }, [authorized, tab]);

  useEffect(() => {
    const previewUrls = productNewImages.map((file) =>
      URL.createObjectURL(file)
    );

    setProductNewImagePreviews(previewUrls);

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [productNewImages]);

  function showMessage(value: string) {
    setMessage(value);

    window.setTimeout(() => {
      setMessage("");
    }, 2400);
  }

  function makeProductSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadProductImage(file: File) {
    if (!file.type.startsWith("image/")) {
      throw new Error("اختر ملفات صور فقط");
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new Error("حجم الصورة يجب ألا يتجاوز 8 ميجابايت");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `products/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  function addProductImageFiles(fileList: FileList | null) {
    const selectedFiles = Array.from(fileList ?? []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (!selectedFiles.length) return;

    setProductNewImages((current) => {
      const updated = [...current];

      selectedFiles.forEach((file) => {
        const exists = updated.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!exists) updated.push(file);
      });

      return updated;
    });
  }

  function removeProductNewImage(index: number) {
    setProductNewImages((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProductName("");
    setProductPlatform("PC");
    setProductDetailCategory("");
    setProductCardBadge("");
    setProductPrice("");
    setProductOldPrice("");
    setProductDiscountPercent("");
    setProductDescription("");
    setProductOwnership("");
    setProductUsage("");
    setProductSoldCount("0");
    setProductStock("0");
    setProductDisplayKind("featured");
    setProductHomeSection("");
    setProductCategoryIds([]);
    setProductActive(true);
    setProductNewImages([]);
    setEditingProductImages([]);
  }

  function openProductForm(product?: ProductOption) {
    resetProductForm();

    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductPlatform(product.platform || "PC");
      setProductDetailCategory(product.detail_category_label || "");
      setProductCardBadge(product.card_badge || "");
      setProductPrice(String(product.price));
      setProductOldPrice(
        product.old_price === null ? "" : String(product.old_price)
      );
      setProductDiscountPercent(
        product.discount_percent === null
          ? ""
          : String(product.discount_percent)
      );
      setProductDescription(product.description || "");
      setProductOwnership(product.ownership_text || "");
      setProductUsage(product.usage_text || "");
      setProductSoldCount(String(product.sold_count));
      setProductStock(String(product.stock));
      setProductDisplayKind(product.display_kind);
      setProductActive(product.is_active);
      setEditingProductImages(
        productImages
          .filter((image) => image.product_id === product.id)
          .sort((first, second) => first.sort_order - second.sort_order)
      );

      const homeItem = homePageItems.find(
        (item) => item.product_id === product.id
      );
      setProductHomeSection(
        homeItem && homeItem.section_key !== "packages"
          ? homeItem.section_key
          : ""
      );

      setProductCategoryIds(
        homeCategoryItems
          .filter((item) => item.product_id === product.id)
          .map((item) => item.category_id)
      );
    }

    setProductFormOpen(true);
  }

  async function syncProductPlacements(productId: string) {
    const { error: deleteHomeError } = await supabase
      .from("home_page_items")
      .delete()
      .eq("product_id", productId);

    if (deleteHomeError) throw deleteHomeError;

    if (productHomeSection) {
      const sectionItems = homePageItems.filter(
        (item) => item.section_key === productHomeSection
      );
      const nextOrder = sectionItems.length
        ? Math.max(...sectionItems.map((item) => item.sort_order)) + 1
        : 0;

      const { error } = await supabase.from("home_page_items").insert({
        section_key: productHomeSection,
        product_id: productId,
        package_id: null,
        sort_order: nextOrder,
        is_active: true,
      });
      if (error) throw error;
    }

    const { error: deleteCategoriesError } = await supabase
      .from("home_category_items")
      .delete()
      .eq("product_id", productId);

    if (deleteCategoriesError) throw deleteCategoriesError;

    if (productCategoryIds.length) {
      const rows = productCategoryIds.map((categoryId) => {
        const existingItems = homeCategoryItems.filter(
          (item) =>
            item.category_id === categoryId && item.product_id !== productId
        );
        const nextOrder = existingItems.length
          ? Math.max(...existingItems.map((item) => item.sort_order)) + 1
          : 0;

        return {
          category_id: categoryId,
          product_id: productId,
          package_id: null,
          sort_order: nextOrder,
          is_active: true,
        };
      });

      const { error } = await supabase
        .from("home_category_items")
        .insert(rows);
      if (error) throw error;
    }
  }

  async function saveProduct() {
    setErrorMessage("");

    if (!productName.trim()) {
      setErrorMessage("اكتب اسم اللعبة");
      return;
    }

    if (!productPrice || toNumber(productPrice) < 0) {
      setErrorMessage("اكتب سعر اللعبة");
      return;
    }

    const discountPercent = productDiscountPercent
      ? Math.min(100, Math.max(0, toNumber(productDiscountPercent)))
      : null;

    setSavingProduct(true);

    try {
      const payload = {
        name: productName.trim(),
        slug:
          editingProduct?.slug ||
          `${makeProductSlug(productName) || "game"}-${Date.now()}`,
        short_description: productCardBadge.trim() || null,
        description: productDescription.trim() || null,
        price: toNumber(productPrice),
        old_price: productOldPrice ? toNumber(productOldPrice) : null,
        stock: Math.max(0, Math.floor(toNumber(productStock))),
        platform: productPlatform.trim() || "PC",
        is_shared: productDisplayKind === "shared",
        is_featured: productDisplayKind === "featured",
        is_best_seller_manual: false,
        is_active: productActive,
        sold_count: Math.max(0, Math.floor(toNumber(productSoldCount))),
        display_kind: productDisplayKind,
        card_badge: productCardBadge.trim() || null,
        detail_category_label: productDetailCategory.trim() || null,
        ownership_text: productOwnership.trim() || null,
        usage_text: productUsage.trim() || null,
        discount_percent: discountPercent,
      };

      let productId = editingProduct?.id;

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            ...payload,
            category_id: null,
            cover_url: null,
            created_by: user?.id ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      if (!productId) throw new Error("تعذر حفظ اللعبة");

      const startingOrder = editingProductImages.length
        ? Math.max(
            ...editingProductImages.map((image) => image.sort_order)
          ) + 1
        : 0;
      const uploadedRows: Array<{
        product_id: string;
        image_url: string;
        title: string;
        sort_order: number;
      }> = [];

      for (let index = 0; index < productNewImages.length; index += 1) {
        const file = productNewImages[index];
        const imageUrl = await uploadProductImage(file);
        uploadedRows.push({
          product_id: productId,
          image_url: imageUrl,
          title: file.name.replace(/\.[^.]+$/, "") || `صورة ${index + 1}`,
          sort_order: startingOrder + index,
        });
      }

      if (uploadedRows.length) {
        const { error } = await supabase
          .from("product_images")
          .insert(uploadedRows);
        if (error) throw error;
      }

      const allImages = [
        ...editingProductImages.map((image) => image.image_url),
        ...uploadedRows.map((image) => image.image_url),
      ];
      const coverUrl = allImages[0] || editingProduct?.cover_url || null;

      const { error: coverError } = await supabase
        .from("products")
        .update({ cover_url: coverUrl })
        .eq("id", productId);
      if (coverError) throw coverError;

      await syncProductPlacements(productId);

      showMessage(editingProduct ? "تم تعديل اللعبة" : "تمت إضافة اللعبة");
      setProductFormOpen(false);
      resetProductForm();
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر حفظ اللعبة"
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(product: ProductOption) {
    if (!window.confirm(`حذف لعبة ${product.name} نهائيًا؟`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تم حذف اللعبة");
    await loadData();
  }

  async function toggleProductActive(product: ProductOption) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !product.is_active })
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadData();
  }

  async function deleteProductImage(image: ProductImageRow) {
    if (!window.confirm("حذف هذه الصورة؟")) return;

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const remaining = editingProductImages.filter(
      (current) => current.id !== image.id
    );
    setEditingProductImages(remaining);

    if (editingProduct?.cover_url === image.image_url) {
      await supabase
        .from("products")
        .update({ cover_url: remaining[0]?.image_url ?? null })
        .eq("id", editingProduct.id);
    }
  }

  async function moveProductImage(
    image: ProductImageRow,
    direction: "up" | "down"
  ) {
    const items = [...editingProductImages].sort(
      (first, second) => first.sort_order - second.sort_order
    );
    const index = items.findIndex((item) => item.id === image.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= items.length) return;

    const target = items[targetIndex];
    const { error: firstError } = await supabase
      .from("product_images")
      .update({ sort_order: target.sort_order })
      .eq("id", image.id);
    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("product_images")
      .update({ sort_order: image.sort_order })
      .eq("id", target.id);
    if (secondError) {
      setErrorMessage(secondError.message);
      return;
    }

    const reordered = [...items];
    reordered[index] = { ...target, sort_order: image.sort_order };
    reordered[targetIndex] = { ...image, sort_order: target.sort_order };
    reordered.sort((first, second) => first.sort_order - second.sort_order);
    setEditingProductImages(reordered);

    if (editingProduct && reordered[0]?.image_url) {
      await supabase
        .from("products")
        .update({ cover_url: reordered[0].image_url })
        .eq("id", editingProduct.id);
    }
  }

  function resetDiscountCodeForm() {
    setEditingDiscountCodeId(null);
    setDiscountCodeText("");
    setDiscountCodePercent("");
    setDiscountCodeAppliesToAll(false);
    setDiscountCodeActive(true);
    setDiscountCodeProductIds([]);
  }

  function openDiscountCodeForEdit(code: DiscountCodeRow) {
    setEditingDiscountCodeId(code.id);
    setDiscountCodeText(code.code);
    setDiscountCodePercent(String(code.discount_percent));
    setDiscountCodeAppliesToAll(code.applies_to_all);
    setDiscountCodeActive(code.is_active);
    setDiscountCodeProductIds(
      discountCodeProducts
        .filter((item) => item.discount_code_id === code.id)
        .map((item) => item.product_id)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveDiscountCode() {
    setErrorMessage("");

    const normalizedCode = discountCodeText
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
    const percent = Math.min(
      100,
      Math.max(1, toNumber(discountCodePercent))
    );

    if (!/^[A-Z0-9_-]{1,30}$/.test(normalizedCode)) {
      setErrorMessage(
        "اكتب كودًا من حرف واحد إلى 30 حرفًا إنجليزيًا أو رقمًا بدون مسافات"
      );
      return;
    }

    if (!discountCodePercent || percent <= 0) {
      setErrorMessage("اكتب نسبة خصم صحيحة");
      return;
    }

    if (!discountCodeAppliesToAll && !discountCodeProductIds.length) {
      setErrorMessage("اختر الكل أو اختر لعبة واحدة على الأقل لهذا الكود");
      return;
    }

    setSavingDiscountCode(true);

    try {
      const payload = {
        code: normalizedCode,
        discount_type: "percentage",
        discount_value: percent,
        minimum_order: 0,
        usage_limit: null,
        usage_per_user: 1,
        starts_at: null,
        ends_at: null,
        discount_percent: percent,
        applies_to_all: discountCodeAppliesToAll,
        is_active: discountCodeActive,
      };

      let codeId = editingDiscountCodeId;

      if (editingDiscountCodeId) {
        const { error } = await supabase
          .from("discount_codes")
          .update(payload)
          .eq("id", editingDiscountCodeId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("discount_codes")
          .insert({
            ...payload,
            used_count: 0,
          })
          .select("id")
          .single();
        if (error) throw error;
        codeId = data.id;
      }

      if (!codeId) throw new Error("تعذر حفظ كود الخصم");

      const { error: deleteAssignmentsError } = await supabase
        .from("discount_code_products")
        .delete()
        .eq("discount_code_id", codeId);
      if (deleteAssignmentsError) throw deleteAssignmentsError;

      if (!discountCodeAppliesToAll) {
        const assignmentRows = discountCodeProductIds.map((productId) => ({
          discount_code_id: codeId,
          product_id: productId,
        }));

        const { error: assignmentError } = await supabase
          .from("discount_code_products")
          .insert(assignmentRows);
        if (assignmentError) throw assignmentError;
      }

      showMessage(
        editingDiscountCodeId
          ? "تم تعديل كود الخصم"
          : "تم إنشاء كود الخصم"
      );
      resetDiscountCodeForm();
      await loadData();
    } catch (error) {
      console.error("تعذر حفظ كود الخصم:", error);

      const message = getDatabaseErrorMessage(error);
      const normalizedMessage = message.toLowerCase();

      setErrorMessage(
        normalizedMessage.includes("duplicate") ||
          normalizedMessage.includes("unique") ||
          normalizedMessage.includes("23505")
          ? "كود الخصم مستخدم مسبقًا"
          : normalizedMessage.includes("row-level security") ||
              normalizedMessage.includes("permission denied")
            ? "صلاحيات حفظ أكواد الخصم غير مفعلة. شغّل ملف SQL المرفق كاملًا."
            : normalizedMessage.includes("applies_to_all")
              ? "عمود خيار جميع الألعاب غير موجود. شغّل ملف SQL المرفق كاملًا."
              : message
      );
    } finally {
      setSavingDiscountCode(false);
    }
  }

  async function toggleDiscountCodeActive(code: DiscountCodeRow) {
    const { error } = await supabase
      .from("discount_codes")
      .update({
        is_active: !code.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", code.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage(code.is_active ? "تم إيقاف الكود" : "تم تفعيل الكود");
    await loadData();
  }

  async function deleteDiscountCode(code: DiscountCodeRow) {
    if (!window.confirm(`حذف كود ${code.code} نهائيًا؟`)) return;

    const { error } = await supabase
      .from("discount_codes")
      .delete()
      .eq("id", code.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (editingDiscountCodeId === code.id) resetDiscountCodeForm();
    showMessage("تم حذف كود الخصم");
    await loadData();
  }

  async function updateOrderStatus(
    order: UserOrder,
    status: "processing" | "completed" | "cancelled"
  ) {
    let cancellationReason: string | null = null;

    if (status === "cancelled") {
      cancellationReason = window.prompt("اكتب سبب إلغاء الطلب:")?.trim() || null;
      if (!cancellationReason) return;
    }

    setUpdatingOrderId(order.id);
    setErrorMessage("");

    try {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
        cancellation_reason:
          status === "cancelled" ? cancellationReason : null,
      };

      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      } else if (order.status === "completed") {
        updates.completed_at = null;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", order.id)
        .select("*, order_items(*), payments(*)")
        .single();

      if (error) throw error;

      const updatedOrder = data as UserOrder;

      setOrders((current) =>
        current.map((item) =>
          item.id === updatedOrder.id ? updatedOrder : item
        )
      );

      setSelectedOrder((current) =>
        current?.id === updatedOrder.id ? updatedOrder : current
      );

      showMessage(`تم تغيير حالة الطلب إلى ${statusLabel[status]}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر تحديث حالة الطلب"
      );
    } finally {
      setUpdatingOrderId(null);
    }
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

  function normalizeHomeCategorySlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function makeHomeCategorySlug(value: string) {
    const base = normalizeHomeCategorySlug(value) || "category";
    return `${base}-${Date.now().toString(36)}`;
  }

  function resetHomeCategoryForm() {
    setEditingHomeCategoryId(null);
    setHomeCategoryName("");
    setHomeCategoryIcon("🎮");
    setHomeCategorySlug("");
  }

  async function saveHomeCategory() {
    const name = homeCategoryName.trim();
    const icon = homeCategoryIcon.trim() || "🎮";

    if (!name) {
      setErrorMessage("اكتب اسم تصنيف الصفحة الرئيسية");
      return;
    }

    const currentCategory = homeCategories.find(
      (category) => category.id === editingHomeCategoryId
    );
    const isAllCategory = Boolean(
      currentCategory?.is_system &&
        !currentCategory.slug &&
        !currentCategory.link_url
    );
    const slug = isAllCategory
      ? null
      : normalizeHomeCategorySlug(homeCategorySlug) ||
        makeHomeCategorySlug(name);
    const linkUrl = slug ? `/categories/${slug}` : null;

    setSavingHomeCategory(true);
    setErrorMessage("");

    try {
      if (editingHomeCategoryId) {
        const { error } = await supabase
          .from("home_categories")
          .update({
            name,
            icon,
            slug,
            link_url: linkUrl,
            page_title:
              currentCategory?.page_title?.trim() ||
              name,
            games_title:
              currentCategory?.games_title?.trim() ||
              currentCategory?.page_title?.trim() ||
              name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingHomeCategoryId);

        if (error) throw error;
        showMessage("تم تعديل التصنيف ورابط صفحته");
      } else {
        const nextOrder =
          homeCategories.length > 0
            ? Math.max(
                ...homeCategories.map(
                  (category) => category.sort_order
                )
              ) + 1
            : 0;

        const { data, error } = await supabase
          .from("home_categories")
          .insert({
            name,
            icon,
            slug,
            link_url: linkUrl,
            page_badge: "التصنيف المختار",
            page_title: name,
            page_description:
              "الألعاب الموجودة في هذا التصنيف",
            games_badge: "الألعاب",
            games_title: name,
            empty_title: "لا توجد ألعاب حاليًا",
            empty_description:
              "سيتم إضافة ألعاب جديدة قريبًا",
            use_custom_items: true,
            sort_order: nextOrder,
            is_active: true,
            is_system: false,
          })
          .select("id")
          .single();

        if (error) throw error;

        if (data?.id) {
          setSelectedHomeCategoryId(data.id);
        }

        showMessage("تمت إضافة التصنيف وإنشاء صفحته");
      }

      resetHomeCategoryForm();
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ تصنيف الصفحة الرئيسية"
      );
    } finally {
      setSavingHomeCategory(false);
    }
  }

  async function toggleHomeCategory(category: HomeCategory) {
    setErrorMessage("");

    const { error } = await supabase
      .from("home_categories")
      .update({
        is_active: !category.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadData();
  }

  async function moveHomeCategory(
    category: HomeCategory,
    direction: "up" | "down"
  ) {
    const sorted = [...homeCategories].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const index = sorted.findIndex(
      (item) => item.id === category.id
    );
    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= sorted.length
    ) {
      return;
    }

    const target = sorted[targetIndex];

    const { error: firstError } = await supabase
      .from("home_categories")
      .update({
        sort_order: target.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", category.id);

    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("home_categories")
      .update({
        sort_order: category.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    if (secondError) {
      setErrorMessage(secondError.message);
      return;
    }

    await loadData();
  }

  async function deleteHomeCategory(category: HomeCategory) {
    if (category.is_system) {
      setErrorMessage(
        "التصنيف الأساسي لا ينحذف، لكن تقدر تعدله أو تخفيه"
      );
      return;
    }

    if (!window.confirm(`حذف تصنيف ${category.name} وصفحته؟`)) {
      return;
    }

    const { error } = await supabase
      .from("home_categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (selectedHomeCategoryId === category.id) {
      setSelectedHomeCategoryId("");
    }

    showMessage("تم حذف التصنيف وصفحته");
    await loadData();
  }

  async function saveHomeCategoryPage() {
    if (!selectedHomeCategoryId) {
      setErrorMessage("اختر التصنيف الذي تريد تعديل صفحته");
      return;
    }

    const category = homeCategories.find(
      (item) => item.id === selectedHomeCategoryId
    );

    if (!category?.slug) {
      setErrorMessage("تصنيف الكل لا يملك صفحة مستقلة");
      return;
    }

    if (!homePageTitle.trim()) {
      setErrorMessage("اكتب عنوان صفحة التصنيف");
      return;
    }

    setSavingHomeCategoryPage(true);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("home_categories")
        .update({
          page_badge:
            homePageBadge.trim() || "التصنيف المختار",
          page_title: homePageTitle.trim(),
          page_description:
            homePageDescription.trim() ||
            "الألعاب الموجودة في هذا التصنيف",
          games_badge:
            homeGamesBadge.trim() || "الألعاب",
          games_title:
            homeGamesTitle.trim() ||
            homePageTitle.trim(),
          empty_title:
            homeEmptyTitle.trim() ||
            "لا توجد ألعاب حاليًا",
          empty_description:
            homeEmptyDescription.trim() ||
            "سيتم إضافة ألعاب جديدة قريبًا",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedHomeCategoryId);

      if (error) throw error;

      showMessage("تم حفظ صفحة التصنيف كاملة");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ صفحة التصنيف"
      );
    } finally {
      setSavingHomeCategoryPage(false);
    }
  }

  async function addHomeCategoryItem() {
    if (!selectedHomeCategoryId) {
      setErrorMessage("اختر صفحة التصنيف أولًا");
      return;
    }

    if (!homeCategorySourceId) {
      setErrorMessage(
        homeCategorySourceType === "package"
          ? "اختر البكج"
          : "اختر اللعبة"
      );
      return;
    }

    const duplicate = homeCategoryItems.some(
      (item) =>
        item.category_id === selectedHomeCategoryId &&
        (homeCategorySourceType === "package"
          ? item.package_id === homeCategorySourceId
          : item.product_id === homeCategorySourceId)
    );

    if (duplicate) {
      setErrorMessage("هذا العنصر موجود داخل التصنيف مسبقًا");
      return;
    }

    setSavingHomeCategoryItem(true);
    setErrorMessage("");

    try {
      const nextOrder =
        selectedHomeCategoryItems.length > 0
          ? Math.max(
              ...selectedHomeCategoryItems.map(
                (item) => item.sort_order
              )
            ) + 1
          : 0;

      const { error } = await supabase
        .from("home_category_items")
        .insert({
          category_id: selectedHomeCategoryId,
          product_id:
            homeCategorySourceType === "product"
              ? homeCategorySourceId
              : null,
          package_id:
            homeCategorySourceType === "package"
              ? homeCategorySourceId
              : null,
          sort_order: nextOrder,
          is_active: true,
        });

      if (error) throw error;

      const { error: categoryError } = await supabase
        .from("home_categories")
        .update({
          use_custom_items: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedHomeCategoryId);

      if (categoryError) throw categoryError;

      setHomeCategorySourceId("");
      showMessage("تمت إضافة العنصر لصفحة التصنيف");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر إضافة العنصر لصفحة التصنيف"
      );
    } finally {
      setSavingHomeCategoryItem(false);
    }
  }

  async function moveHomeCategoryItem(
    item: HomeCategoryItem,
    direction: "up" | "down"
  ) {
    const items = homeCategoryItems
      .filter(
        (current) => current.category_id === item.category_id
      )
      .sort((a, b) => a.sort_order - b.sort_order);
    const index = items.findIndex(
      (current) => current.id === item.id
    );
    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= items.length
    ) {
      return;
    }

    const target = items[targetIndex];

    const { error: firstError } = await supabase
      .from("home_category_items")
      .update({
        sort_order: target.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("home_category_items")
      .update({
        sort_order: item.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    if (secondError) {
      setErrorMessage(secondError.message);
      return;
    }

    await loadData();
  }

  async function deleteHomeCategoryItem(item: HomeCategoryItem) {
    if (!window.confirm("إزالة هذا العنصر من صفحة التصنيف؟")) {
      return;
    }

    const { error } = await supabase
      .from("home_category_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تمت إزالة العنصر من صفحة التصنيف");
    await loadData();
  }

  async function saveHomePageItem() {
    if (!homeSourceId) {
      setErrorMessage(
        homeSectionKey === "packages"
          ? "اختر البكج"
          : "اختر اللعبة"
      );
      return;
    }

    const duplicate = homePageItems.some(
      (item) =>
        item.section_key === homeSectionKey &&
        (homeSectionKey === "packages"
          ? item.package_id === homeSourceId
          : item.product_id === homeSourceId)
    );

    if (duplicate) {
      setErrorMessage("هذا العنصر موجود مسبقًا داخل هذا القسم");
      return;
    }

    setSavingHomeItem(true);
    setErrorMessage("");

    try {
      const sectionItems = homePageItems.filter(
        (item) => item.section_key === homeSectionKey
      );
      const nextOrder =
        sectionItems.length > 0
          ? Math.max(
              ...sectionItems.map((item) => item.sort_order)
            ) + 1
          : 0;

      const { error } = await supabase
        .from("home_page_items")
        .insert({
          section_key: homeSectionKey,
          product_id:
            homeSectionKey === "packages"
              ? null
              : homeSourceId,
          package_id:
            homeSectionKey === "packages"
              ? homeSourceId
              : null,
          sort_order: nextOrder,
          is_active: true,
        });

      if (error) throw error;

      setHomeSourceId("");
      showMessage("تمت إضافة العنصر للصفحة الرئيسية");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر إضافة العنصر للصفحة الرئيسية"
      );
    } finally {
      setSavingHomeItem(false);
    }
  }

  async function changeHomePageItemSection(
    item: HomePageItem,
    sectionKey: HomeSectionKey
  ) {
    if (item.package_id && sectionKey !== "packages") {
      setErrorMessage("البكجات توضع داخل قسم بكجات الألعاب");
      return;
    }

    if (item.product_id && sectionKey === "packages") {
      setErrorMessage("قسم البكجات يقبل البكجات فقط");
      return;
    }

    if (item.section_key === sectionKey) return;

    const duplicate = homePageItems.some(
      (current) =>
        current.id !== item.id &&
        current.section_key === sectionKey &&
        current.product_id === item.product_id &&
        current.package_id === item.package_id
    );

    if (duplicate) {
      setErrorMessage("العنصر موجود مسبقًا داخل هذا القسم");
      return;
    }

    const sectionItems = homePageItems.filter(
      (current) => current.section_key === sectionKey
    );
    const nextOrder =
      sectionItems.length > 0
        ? Math.max(
            ...sectionItems.map(
              (current) => current.sort_order
            )
          ) + 1
        : 0;

    const { error } = await supabase
      .from("home_page_items")
      .update({
        section_key: sectionKey,
        sort_order: nextOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تم نقل العنصر للقسم الجديد");
    await loadData();
  }

  async function moveHomePageItem(
    item: HomePageItem,
    direction: "up" | "down"
  ) {
    const sectionItems = homePageItems
      .filter(
        (current) => current.section_key === item.section_key
      )
      .sort((a, b) => a.sort_order - b.sort_order);
    const index = sectionItems.findIndex(
      (current) => current.id === item.id
    );
    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= sectionItems.length
    ) {
      return;
    }

    const target = sectionItems[targetIndex];

    const { error: firstError } = await supabase
      .from("home_page_items")
      .update({
        sort_order: target.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("home_page_items")
      .update({
        sort_order: item.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id);

    if (secondError) {
      setErrorMessage(secondError.message);
      return;
    }

    await loadData();
  }

  async function deleteHomePageItem(item: HomePageItem) {
    if (!window.confirm("إزالة هذا العنصر من الصفحة الرئيسية؟")) {
      return;
    }

    const { error } = await supabase
      .from("home_page_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تمت إزالة العنصر من الصفحة الرئيسية");
    await loadData();
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
              offersHero.badge_text.trim() || "عروض محدودة 🔥",
            title: offersHero.title.trim(),
            description:
              offersHero.description.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (error) throw error;
      showMessage("تم حفظ كتابة صفحة العروض");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ كتابة صفحة العروض"
      );
    } finally {
      setSavingOffersHero(false);
    }
  }

  function makeCategorySlug(value: string) {
    const base = value
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${base || "category"}-${Date.now()}`;
  }

  async function saveOfferCategory() {
    const name = categoryName.trim();

    if (!name) {
      setErrorMessage("اكتب اسم التصنيف");
      return;
    }

    setErrorMessage("");

    try {
      if (editingCategoryId) {
        const { error } = await supabase
          .from("offer_categories")
          .update({ name })
          .eq("id", editingCategoryId);

        if (error) throw error;
        showMessage("تم تعديل اسم التصنيف");
      } else {
        const nextOrder =
          offerCategories.length > 0
            ? Math.max(
                ...offerCategories.map((item) => item.sort_order)
              ) + 1
            : 0;

        const { error } = await supabase
          .from("offer_categories")
          .insert({
            name,
            slug: makeCategorySlug(name),
            filter_key: "custom",
            sort_order: nextOrder,
            is_active: true,
            is_system: false,
          });

        if (error) throw error;
        showMessage("تمت إضافة التصنيف");
      }

      setCategoryName("");
      setEditingCategoryId(null);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ التصنيف"
      );
    }
  }

  async function toggleOfferCategory(
    category: OfferCategory
  ) {
    const { error } = await supabase
      .from("offer_categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadData();
  }

  async function moveOfferCategory(
    category: OfferCategory,
    direction: "up" | "down"
  ) {
    const sorted = [...offerCategories].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const index = sorted.findIndex(
      (item) => item.id === category.id
    );
    const targetIndex =
      direction === "up" ? index - 1 : index + 1;

    if (
      index < 0 ||
      targetIndex < 0 ||
      targetIndex >= sorted.length
    ) {
      return;
    }

    const target = sorted[targetIndex];

    const { error: firstError } = await supabase
      .from("offer_categories")
      .update({ sort_order: target.sort_order })
      .eq("id", category.id);

    if (firstError) {
      setErrorMessage(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("offer_categories")
      .update({ sort_order: category.sort_order })
      .eq("id", target.id);

    if (secondError) {
      setErrorMessage(secondError.message);
      return;
    }

    await loadData();
  }

  async function deleteOfferCategory(
    category: OfferCategory
  ) {
    if (category.is_system) {
      setErrorMessage(
        "التصنيفات الأساسية لا تنحذف، لكن تقدر تغير اسمها أو تخفيها"
      );
      return;
    }

    if (!window.confirm(`حذف تصنيف ${category.name}؟`)) {
      return;
    }

    const { error } = await supabase
      .from("offer_categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    showMessage("تم حذف التصنيف");
    await loadData();
  }

  async function saveOfferCategoryAssignment() {
    setErrorMessage("");

    if (!selectedOfferCategoryProductId) {
      setErrorMessage("اختر اللعبة");
      return;
    }

    if (!selectedOfferCategoryId) {
      setErrorMessage("اختر قسم العروض");
      return;
    }

    const product = products.find(
      (item) => item.id === selectedOfferCategoryProductId
    );
    const category = offerCategories.find(
      (item) => item.id === selectedOfferCategoryId
    );

    if (!product) {
      setErrorMessage("اللعبة غير موجودة");
      return;
    }

    if (!category) {
      setErrorMessage("قسم العروض غير موجود");
      return;
    }

    if (
      category.filter_key === "all" ||
      category.filter_key === "best_seller"
    ) {
      setErrorMessage(
        category.filter_key === "all"
          ? "قسم الكل يعرض جميع الألعاب تلقائيًا"
          : "قسم الأكثر مبيعًا يعتمد على عدد المبيعات تلقائيًا"
      );
      return;
    }

    const existingOffer = offers.find(
      (offer) => offer.product_id === product.id
    );

    const automaticDiscount =
      product.old_price && product.old_price > product.price
        ? Math.round(
            ((product.old_price - product.price) /
              product.old_price) *
              100
          )
        : 0;

    const discountValue = Math.max(
      0,
      toNumber(product.discount_percent ?? automaticDiscount)
    );

    if (!existingOffer && discountValue <= 0) {
      setErrorMessage(
        "اكتب نسبة الخصم الأحمر داخل بيانات اللعبة أولًا"
      );
      return;
    }

    setSavingOfferCategoryAssignment(true);

    try {
      if (existingOffer) {
        const { error } = await supabase
          .from("offers")
          .update({
            offer_category_id: category.id,
            is_active: true,
          })
          .eq("id", existingOffer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("offers")
          .insert({
            title: `تخفيض على ${product.name}`,
            product_id: product.id,
            package_id: null,
            offer_category_id: category.id,
            discount_type: "percentage",
            discount_value: discountValue,
            starts_at: new Date().toISOString(),
            ends_at: null,
            is_active: true,
          });

        if (error) throw error;
      }

      setSelectedOfferCategoryProductId("");
      setSelectedOfferCategoryId("");
      showMessage(`تمت إضافة ${product.name} إلى قسم ${category.name}`);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر إضافة اللعبة إلى قسم العروض"
      );
    } finally {
      setSavingOfferCategoryAssignment(false);
    }
  }

  function selectDiscountProduct(productId: string) {
    setSelectedDiscountProductId(productId);
    setErrorMessage("");

    const selectedOffer = offers.find(
      (offer) => offer.product_id === productId
    );

    setOfferEndsAt(
      toDateTimeLocal(selectedOffer?.ends_at)
    );
  }

  async function saveOfferTime() {
    setErrorMessage("");

    if (!selectedDiscountProductId) {
      setErrorMessage("اختر اللعبة");
      return;
    }

    if (!offerEndsAt) {
      setErrorMessage("حدد تاريخ انتهاء التخفيضات");
      return;
    }

    const endsAt = new Date(offerEndsAt);

    if (Number.isNaN(endsAt.getTime())) {
      setErrorMessage("تاريخ انتهاء التخفيضات غير صحيح");
      return;
    }

    if (endsAt <= new Date()) {
      setErrorMessage("تاريخ انتهاء التخفيضات لازم يكون في المستقبل");
      return;
    }

    const product = products.find(
      (item) => item.id === selectedDiscountProductId
    );

    if (!product) {
      setErrorMessage("اللعبة غير موجودة");
      return;
    }

    const existingOffer = offers.find(
      (offer) => offer.product_id === selectedDiscountProductId
    );

    const automaticDiscount =
      product.old_price && product.old_price > product.price
        ? Math.round(
            ((product.old_price - product.price) /
              product.old_price) *
              100
          )
        : 0;

    const discountValue = Math.max(
      0,
      toNumber(product.discount_percent ?? automaticDiscount)
    );

    if (!existingOffer && discountValue <= 0) {
      setErrorMessage(
        "اكتب نسبة الخصم الأحمر داخل بيانات اللعبة أولًا"
      );
      return;
    }

    setSavingOfferTime(true);

    try {
      if (existingOffer) {
        const { error } = await supabase
          .from("offers")
          .update({
            ends_at: endsAt.toISOString(),
            is_active: true,
          })
          .eq("id", existingOffer.id);

        if (error) throw error;
      } else {
        const defaultCategory =
          offerCategories.find(
            (category) => category.is_active && category.is_system
          ) ??
          offerCategories.find((category) => category.is_active) ??
          null;

        const { error } = await supabase
          .from("offers")
          .insert({
            title: `تخفيض على ${product.name}`,
            product_id: product.id,
            package_id: null,
            offer_category_id: defaultCategory?.id ?? null,
            discount_type: "percentage",
            discount_value: discountValue,
            starts_at: new Date().toISOString(),
            ends_at: endsAt.toISOString(),
            is_active: true,
          });

        if (error) throw error;
      }

      showMessage("تم حفظ تاريخ انتهاء التخفيضات");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ تاريخ انتهاء التخفيضات"
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
              onClick={() => {
                void loadData();
                void loadPresence();
              }}
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
              onClick={() => setTab("overview")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "overview"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">📊</span>
              <span>نظرة عامة</span>
            </button>

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
              onClick={() => setTab("games")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "games"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">🎮</span>
              <span>إدارة الألعاب</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("home")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "home"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">🏠</span>
              <span>الصفحة الرئيسية</span>
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
              onClick={() => setTab("discountCodes")}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-[18px] px-3 py-3 text-xs font-black transition active:scale-[0.98] lg:min-h-0 lg:justify-start ${
                tab === "discountCodes"
                  ? "bg-violet-500/15 text-violet-200"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">🎟️</span>
              <span>أكواد الخصم</span>
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

          {tab === "overview" && (
            <div className="space-y-4">
              <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-violet-300">
                      بيانات المتجر المباشرة
                    </p>
                    <h2 className="mt-1 text-xl font-black sm:text-2xl">
                      نظرة عامة
                    </h2>
                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      المستخدمون، المتصلون الآن، المبيعات وحالات الطلبات.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void loadData();
                      void loadPresence();
                    }}
                    className="self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black text-gray-200 transition active:scale-95"
                  >
                    تحديث البيانات
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  <OverviewCard
                    icon="👥"
                    label="المستخدمون"
                    value={profiles.length.toLocaleString("ar-SA")}
                    hint="حساب مسجل"
                  />
                  <OverviewCard
                    icon="🟢"
                    label="متصل الآن"
                    value={sitePresence.length.toLocaleString("ar-SA")}
                    hint="خلال آخر دقيقتين"
                  />
                  <OverviewCard
                    icon="👀"
                    label="زيارات اليوم"
                    value={visitsToday.toLocaleString("ar-SA")}
                    hint="جلسة متصفح"
                  />
                  <OverviewCard
                    icon="💰"
                    label="إجمالي المبيعات"
                    value={formatMoney(overviewStats.totalSales)}
                    hint="طلبات مدفوعة"
                  />
                  <OverviewCard
                    icon="⚙️"
                    label="قيد التجهيز"
                    value={overviewStats.processing.toLocaleString("ar-SA")}
                    hint="طلب"
                  />
                  <OverviewCard
                    icon="✅"
                    label="مكتملة"
                    value={overviewStats.completed.toLocaleString("ar-SA")}
                    hint={`${overviewStats.cancelled.toLocaleString("ar-SA")} ملغية`}
                  />
                </div>
              </section>

              <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-300">
                      مباشر
                    </p>
                    <h3 className="mt-1 text-lg font-black">
                      الموجودون في الموقع الآن
                    </h3>
                  </div>
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-[9px] font-black text-emerald-300">
                    {sitePresence.length} متصل
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {sitePresence.map((presence) => {
                    const profile = presence.user_id
                      ? profiles.find((item) => item.id === presence.user_id)
                      : null;

                    return (
                      <div
                        key={presence.session_id}
                        className="flex items-center gap-3 rounded-[20px] border border-white/[0.07] bg-black/20 p-3"
                      >
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-lg">
                          {profile ? "👤" : "🌐"}
                          <span className="absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-[#121019] bg-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black">
                            {profile?.display_name ||
                              presence.display_name ||
                              (profile?.email ? profile.email.split("@")[0] : "زائر")}
                          </p>
                          <p dir="ltr" className="mt-1 truncate text-left text-[9px] text-gray-500">
                            {presence.current_path || "/"}
                          </p>
                        </div>
                        <p className="shrink-0 text-[8px] text-gray-600">
                          {formatDate(presence.last_seen_at)}
                        </p>
                      </div>
                    );
                  })}

                  {!sitePresence.length && (
                    <div className="sm:col-span-2 rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
                      لا يوجد أحد مسجل كمتصل الآن.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-violet-300">
                      إدارة الطلبات
                    </p>
                    <h3 className="mt-1 text-lg font-black">
                      جميع الطلبات
                    </h3>
                    <p className="mt-2 text-xs text-gray-500">
                      غيّر الحالة أو افتح التفاصيل الكاملة للطلب.
                    </p>
                  </div>

                  <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {[
                      { key: "all", label: "الكل" },
                      { key: "processing", label: "قيد التجهيز" },
                      { key: "completed", label: "مكتملة" },
                      { key: "cancelled", label: "ملغية" },
                      { key: "pending", label: "بانتظار الدفع" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setOrderStatusFilter(item.key as OrderStatus | "all")
                        }
                        className={`shrink-0 rounded-xl border px-3 py-2 text-[9px] font-black transition ${
                          orderStatusFilter === item.key
                            ? "border-violet-400/25 bg-violet-500/15 text-violet-200"
                            : "border-white/10 bg-white/[0.03] text-gray-500"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {filteredOverviewOrders.map((order) => {
                    const profile = profiles.find(
                      (item) => item.id === order.user_id
                    );
                    const firstItem = order.order_items?.[0];

                    return (
                      <div
                        key={order.id}
                        className="rounded-[22px] border border-white/[0.07] bg-black/20 p-3 sm:p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-violet-500/10 text-xl">
                            {firstItem?.image_url ? (
                              <img
                                src={firstItem.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              "🛒"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs font-black">
                                {order.order_number}
                              </p>
                              <span
                                className={`rounded-full border px-2 py-1 text-[7px] font-black ${statusClass[order.status]}`}
                              >
                                {statusLabel[order.status]}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-[10px] text-gray-400">
                              {order.customer_name ||
                                profile?.display_name ||
                                order.customer_email ||
                                profile?.email ||
                                "مستخدم"}
                            </p>
                            <p className="mt-1 truncate text-[9px] text-gray-600">
                              {firstItem?.item_name || "لا توجد عناصر"}{" "}
                              {(order.order_items?.length ?? 0) > 1
                                ? `+${(order.order_items?.length ?? 1) - 1}`
                                : ""}
                            </p>
                          </div>

                          <div className="shrink-0 text-left">
                            <p className="text-sm font-black">
                              {formatMoney(order.total)}
                            </p>
                            <p className="mt-1 text-[8px] text-gray-600">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                          <select
                            value={
                              ["processing", "completed", "cancelled"].includes(
                                order.status
                              )
                                ? order.status
                                : ""
                            }
                            onChange={(event) => {
                              const value = event.target.value as
                                | "processing"
                                | "completed"
                                | "cancelled"
                                | "";
                              if (value) void updateOrderStatus(order, value);
                            }}
                            disabled={updatingOrderId === order.id}
                            className="w-full rounded-2xl border border-white/10 bg-[#171322] px-3 py-3 text-xs font-black text-white outline-none disabled:opacity-50"
                          >
                            <option value="">تغيير حالة الطلب</option>
                            <option value="processing">قيد التجهيز</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-2xl border border-violet-400/15 bg-violet-500/10 px-4 py-3 text-xs font-black text-violet-200 transition active:scale-95"
                          >
                            تفاصيل الطلب
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {!filteredOverviewOrders.length && (
                    <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-xs text-gray-500">
                      لا توجد طلبات في هذه الحالة.
                    </div>
                  )}
                </div>
              </section>
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

          {tab === "games" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    إدارة محتوى المتجر
                  </p>
                  <h2 className="mt-1 text-xl font-black">إدارة الألعاب</h2>
                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    أضف اللعبة وعدّل بطاقتها وصفحة تفاصيلها وصورها ومكان ظهورها، بدون تغيير التصميم.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openProductForm()}
                  className="shrink-0 rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-4 py-3 text-xs font-black shadow-lg shadow-violet-950/30"
                >
                  + إضافة لعبة
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                  const automaticDiscount =
                    product.old_price && product.old_price > product.price
                      ? Math.round(
                          ((product.old_price - product.price) /
                            product.old_price) *
                            100
                        )
                      : 0;
                  const discount =
                    product.discount_percent ?? automaticDiscount;

                  return (
                    <article
                      key={product.id}
                      className="overflow-hidden rounded-[22px] border border-white/10 bg-black/20"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-700/20 to-fuchsia-700/15">
                        {product.cover_url ? (
                          <img
                            src={product.cover_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-5xl">🎮</div>
                        )}

                        {discount > 0 && (
                          <span className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-1 text-[9px] font-black">
                            -{discount}%
                          </span>
                        )}

                        {product.card_badge && (
                          <span className="absolute left-2 top-2 max-w-[55%] truncate rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[8px] font-black backdrop-blur-md">
                            {product.card_badge}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{product.name}</p>
                            <p className="mt-1 text-[9px] text-gray-500">
                              {product.detail_category_label || "بدون تصنيف"} • {product.platform}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[8px] font-black ${
                              product.is_active
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {product.is_active ? "ظاهر" : "مخفي"}
                          </span>
                        </div>

                        <div className="mt-3 flex items-end justify-between">
                          <p className="text-base font-black">{formatMoney(product.price)}</p>
                          <p className="text-[9px] text-gray-500">
                            {product.sold_count.toLocaleString("ar-SA")} شراء
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => openProductForm(product)}
                            className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-2 py-2.5 text-[9px] font-black text-violet-200"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductActive(product)}
                            className="rounded-xl border border-white/10 bg-white/5 px-2 py-2.5 text-[9px] font-black"
                          >
                            {product.is_active ? "إخفاء" : "إظهار"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(product)}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-2 py-2.5 text-[9px] font-black text-red-300"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {!products.length && (
                  <div className="sm:col-span-2 xl:col-span-3 rounded-[22px] border border-dashed border-white/10 px-4 py-12 text-center text-xs text-gray-500">
                    لا توجد ألعاب حتى الآن. اضغط «إضافة لعبة».
                  </div>
                )}
              </div>
            </section>
          )}

          {tab === "home" && (
            <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-violet-300">
                    إدارة محتوى المتجر
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    الصفحة الرئيسية
                  </h2>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    عدّل التصنيفات واختر الألعاب والبكجات التي تظهر في كل قسم، بدون تغيير تصميم الصفحة.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl">
                  🏠
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">
                        تصنيفات الصفحة الرئيسية
                      </h3>
                      <p className="mt-1 text-[10px] leading-5 text-gray-500">
                        أضف تصنيفًا أو عدّل اسمه وأيقونته ورابطه، ورتّبه أو أخفه.
                      </p>
                    </div>

                    <span className="rounded-xl bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200">
                      {homeCategories.length} تصنيف
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[90px_1fr]">
                    <AdminField label="الأيقونة">
                      <input
                        value={homeCategoryIcon}
                        onChange={(event) =>
                          setHomeCategoryIcon(event.target.value)
                        }
                        maxLength={8}
                        placeholder="🎮"
                        className={adminInputClass}
                      />
                    </AdminField>

                    <AdminField label="اسم التصنيف">
                      <input
                        value={homeCategoryName}
                        onChange={(event) =>
                          setHomeCategoryName(event.target.value)
                        }
                        placeholder="مثال: ألعاب السباقات"
                        className={adminInputClass}
                      />
                    </AdminField>
                  </div>

                  <div className="mt-3">
                    <AdminField label="رابط الصفحة — اكتب الجزء الأخير فقط">
                      <div
                        dir="ltr"
                        className="flex items-center overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.04] text-sm"
                      >
                        <span className="shrink-0 border-r border-white/10 px-3 text-[10px] text-gray-500">
                          /categories/
                        </span>
                        <input
                          dir="ltr"
                          value={homeCategorySlug}
                          onChange={(event) =>
                            setHomeCategorySlug(
                              normalizeHomeCategorySlug(
                                event.target.value
                              )
                            )
                          }
                          placeholder="racing"
                          className="min-w-0 flex-1 bg-transparent px-3 py-4 text-left text-white outline-none placeholder:text-gray-600"
                        />
                      </div>
                    </AdminField>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={saveHomeCategory}
                      disabled={savingHomeCategory}
                      className="rounded-[18px] bg-violet-600 px-4 py-3.5 text-xs font-black disabled:opacity-50"
                    >
                      {savingHomeCategory
                        ? "جاري الحفظ..."
                        : editingHomeCategoryId
                          ? "حفظ التعديل"
                          : "إضافة التصنيف"}
                    </button>

                    <button
                      type="button"
                      onClick={resetHomeCategoryForm}
                      className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3.5 text-xs font-black text-gray-300"
                    >
                      مسح الحقول
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {homeCategories.map((category, index) => (
                      <div
                        key={category.id}
                        className="flex flex-wrap items-center gap-2 rounded-[18px] border border-white/10 bg-black/20 p-3"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                          {category.icon || "🎮"}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black">
                            {category.name}
                          </p>
                          <p
                            dir="ltr"
                            className="mt-1 truncate text-left text-[8px] text-gray-500"
                          >
                            {category.slug
                              ? `/categories/${category.slug}`
                              : "بدون صفحة مستقلة"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingHomeCategoryId(category.id);
                            setHomeCategoryName(category.name);
                            setHomeCategoryIcon(
                              category.icon || "🎮"
                            );
                            setHomeCategorySlug(
                              category.slug || ""
                            );
                          }}
                          className="rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[9px] font-black text-violet-200"
                        >
                          تعديل التصنيف
                        </button>

                        {category.slug && (
                          <Link
                            href={`/categories/${category.slug}`}
                            target="_blank"
                            className="rounded-xl border border-fuchsia-400/15 bg-fuchsia-500/10 px-3 py-2 text-[9px] font-black text-fuchsia-200"
                          >
                            فتح الصفحة
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            toggleHomeCategory(category)
                          }
                          className={`rounded-xl px-3 py-2 text-[9px] font-black ${
                            category.is_active
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {category.is_active ? "ظاهر" : "مخفي"}
                        </button>

                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() =>
                            moveHomeCategory(category, "up")
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] disabled:opacity-30"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          disabled={
                            index === homeCategories.length - 1
                          }
                          onClick={() =>
                            moveHomeCategory(category, "down")
                          }
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] disabled:opacity-30"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteHomeCategory(category)
                          }
                          className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-[9px] font-black text-red-300"
                        >
                          حذف
                        </button>
                      </div>
                    ))}

                    {!homeCategories.length && (
                      <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
                        لا توجد تصنيفات حتى الآن.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-violet-400/15 bg-violet-500/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">
                        تعديل صفحة التصنيف
                      </h3>
                      <p className="mt-1 text-[10px] leading-5 text-gray-500">
                        اختر التصنيف وعدّل جميع النصوص التي تظهر داخل صفحته.
                      </p>
                    </div>

                    {homeCategories.find(
                      (category) =>
                        category.id === selectedHomeCategoryId
                    )?.slug && (
                      <Link
                        href={`/categories/${
                          homeCategories.find(
                            (category) =>
                              category.id === selectedHomeCategoryId
                          )?.slug
                        }`}
                        target="_blank"
                        className="shrink-0 rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[9px] font-black text-violet-200"
                      >
                        معاينة
                      </Link>
                    )}
                  </div>

                  <div className="mt-4">
                    <AdminField label="اختر صفحة التصنيف">
                      <select
                        value={selectedHomeCategoryId}
                        onChange={(event) =>
                          setSelectedHomeCategoryId(
                            event.target.value
                          )
                        }
                        className={adminInputClass}
                      >
                        <option value="">اختر تصنيفًا</option>
                        {homeCategories
                          .filter((category) => category.slug)
                          .map((category) => (
                            <option
                              key={category.id}
                              value={category.id}
                            >
                              {category.icon} {category.name}
                            </option>
                          ))}
                      </select>
                    </AdminField>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <AdminField label="العبارة الصغيرة أعلى الصفحة">
                      <input
                        value={homePageBadge}
                        onChange={(event) =>
                          setHomePageBadge(event.target.value)
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>

                    <AdminField label="عنوان الصفحة">
                      <input
                        value={homePageTitle}
                        onChange={(event) =>
                          setHomePageTitle(event.target.value)
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>
                  </div>

                  <div className="mt-3">
                    <AdminField label="وصف الصفحة">
                      <textarea
                        value={homePageDescription}
                        onChange={(event) =>
                          setHomePageDescription(
                            event.target.value
                          )
                        }
                        rows={3}
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} resize-none leading-6 disabled:opacity-40`}
                      />
                    </AdminField>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <AdminField label="العبارة الصغيرة فوق الألعاب">
                      <input
                        value={homeGamesBadge}
                        onChange={(event) =>
                          setHomeGamesBadge(event.target.value)
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>

                    <AdminField label="عنوان قسم الألعاب">
                      <input
                        value={homeGamesTitle}
                        onChange={(event) =>
                          setHomeGamesTitle(event.target.value)
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <AdminField label="عنوان الصفحة الفارغة">
                      <input
                        value={homeEmptyTitle}
                        onChange={(event) =>
                          setHomeEmptyTitle(event.target.value)
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>

                    <AdminField label="وصف الصفحة الفارغة">
                      <input
                        value={homeEmptyDescription}
                        onChange={(event) =>
                          setHomeEmptyDescription(
                            event.target.value
                          )
                        }
                        disabled={!selectedHomeCategoryId}
                        className={`${adminInputClass} disabled:opacity-40`}
                      />
                    </AdminField>
                  </div>

                  <button
                    type="button"
                    onClick={saveHomeCategoryPage}
                    disabled={
                      savingHomeCategoryPage ||
                      !selectedHomeCategoryId
                    }
                    className="mt-4 w-full rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black disabled:opacity-50"
                  >
                    {savingHomeCategoryPage
                      ? "جاري حفظ الصفحة..."
                      : "حفظ صفحة التصنيف"}
                  </button>
                </div>

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
                  onClick={async () => {
                    setOffersInnerTab("discounts");
                    setSelectedDiscountProductId("");
                    await loadData();
                  }}
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
                <div className="mt-5 space-y-5">
                  <div className="rounded-[24px] border border-violet-400/20 bg-gradient-to-br from-violet-900/60 via-[#171128] to-fuchsia-900/30 p-5 text-center">
                    <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200">
                      {offersHero.badge_text}
                    </span>

                    <h3 className="mx-auto mt-4 max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                      {offersHero.title}
                    </h3>

                    <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-gray-400">
                      {offersHero.description}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-black">
                      تعديل كتابة صفحة العروض
                    </h3>

                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      نفس التصميم يبقى كما هو، وأنت تعدل الكتابة فقط.
                    </p>

                    <div className="mt-4 space-y-4">
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
                          placeholder="وفر أكثر على ألعابك المفضلة"
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
                          className={`${adminInputClass} resize-none leading-7`}
                        />
                      </AdminField>

                      <button
                        type="button"
                        onClick={saveOffersHero}
                        disabled={savingOffersHero}
                        className="w-full rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black disabled:opacity-50"
                      >
                        {savingOffersHero
                          ? "جاري الحفظ..."
                          : "حفظ الكتابة"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black">
                          تصنيفات صفحة العروض
                        </h3>
                        <p className="mt-1 text-[10px] leading-5 text-gray-500">
                          عدّل الموجود أو أضف تصنيفًا جديدًا، ورتّبه أو أخفه.
                        </p>
                      </div>

                      <span className="rounded-xl bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200">
                        {offerCategories.length} تصنيف
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <input
                        value={categoryName}
                        onChange={(event) =>
                          setCategoryName(event.target.value)
                        }
                        placeholder="اسم التصنيف"
                        className={adminInputClass}
                      />

                      <button
                        type="button"
                        onClick={saveOfferCategory}
                        className="shrink-0 rounded-[18px] bg-violet-600 px-4 text-xs font-black"
                      >
                        {editingCategoryId ? "حفظ" : "إضافة"}
                      </button>
                    </div>

                    {editingCategoryId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(null);
                          setCategoryName("");
                        }}
                        className="mt-2 text-[10px] font-black text-gray-500"
                      >
                        إلغاء التعديل
                      </button>
                    )}

                    <div className="mt-4 space-y-2">
                      {offerCategories.map((category, index) => (
                        <div
                          key={category.id}
                          className="flex flex-wrap items-center gap-2 rounded-[18px] border border-white/10 bg-black/20 p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black">
                              {category.name}
                            </p>
                            <p className="mt-1 text-[8px] text-gray-500">
                              {category.is_system
                                ? "تصنيف أساسي"
                                : "تصنيف مضاف"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setCategoryName(category.name);
                            }}
                            className="rounded-xl border border-violet-400/15 bg-violet-500/10 px-3 py-2 text-[9px] font-black text-violet-200"
                          >
                            تعديل
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleOfferCategory(category)
                            }
                            className={`rounded-xl px-3 py-2 text-[9px] font-black ${
                              category.is_active
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {category.is_active ? "ظاهر" : "مخفي"}
                          </button>

                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() =>
                              moveOfferCategory(category, "up")
                            }
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] disabled:opacity-30"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            disabled={
                              index === offerCategories.length - 1
                            }
                            onClick={() =>
                              moveOfferCategory(category, "down")
                            }
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[9px] disabled:opacity-30"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteOfferCategory(category)
                            }
                            className="rounded-xl border border-red-400/15 bg-red-500/10 px-3 py-2 text-[9px] font-black text-red-300"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 border-t border-white/10 pt-5">
                      <h4 className="text-xs font-black">
                        إضافة لعبة إلى قسم في صفحة العروض
                      </h4>

                      <p className="mt-1 text-[10px] leading-5 text-gray-500">
                        اختر أي لعبة أضفتها من إدارة الألعاب، ثم اختر القسم الذي تظهر داخله.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <AdminField label="اختر اللعبة">
                          <select
                            value={selectedOfferCategoryProductId}
                            onChange={(event) =>
                              setSelectedOfferCategoryProductId(
                                event.target.value
                              )
                            }
                            className={adminInputClass}
                          >
                            <option value="">اختر لعبة</option>
                            {products.map((product) => {
                              const currentOffer = offers.find(
                                (offer) =>
                                  offer.product_id === product.id
                              );
                              const currentCategory =
                                offerCategories.find(
                                  (category) =>
                                    category.id ===
                                    currentOffer?.offer_category_id
                                );

                              return (
                                <option
                                  key={product.id}
                                  value={product.id}
                                >
                                  {product.name}
                                  {currentCategory
                                    ? ` — ${currentCategory.name}`
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                        </AdminField>

                        <AdminField label="اختر القسم">
                          <select
                            value={selectedOfferCategoryId}
                            onChange={(event) =>
                              setSelectedOfferCategoryId(
                                event.target.value
                              )
                            }
                            className={adminInputClass}
                          >
                            <option value="">اختر قسمًا</option>
                            {offerCategories
                              .filter(
                                (category) =>
                                  category.is_active &&
                                  category.filter_key !== "all" &&
                                  category.filter_key !== "best_seller"
                              )
                              .map((category) => (
                                <option
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </option>
                              ))}
                          </select>
                        </AdminField>
                      </div>

                      <button
                        type="button"
                        onClick={saveOfferCategoryAssignment}
                        disabled={savingOfferCategoryAssignment}
                        className="mt-4 w-full rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-xs font-black disabled:opacity-50"
                      >
                        {savingOfferCategoryAssignment
                          ? "جاري الإضافة..."
                          : "إضافة اللعبة إلى القسم"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {offersInnerTab === "discounts" && (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="text-sm font-black">
                      تاريخ انتهاء التخفيضات
                    </h3>

                    <p className="mt-1 text-[10px] leading-5 text-gray-500">
                      اختر أي لعبة موجودة في المتجر وحدد تاريخ انتهاء التخفيضات. الألعاب الجديدة تظهر هنا مباشرة.
                    </p>

                    <div className="mt-4 space-y-4">
                      <AdminField label="اختر اللعبة">
                        <select
                          key={`discount-product-${products.length}-${products
                            .map((product) => product.id)
                            .join("-")}`}
                          value={selectedDiscountProductId}
                          onChange={(event) =>
                            selectDiscountProduct(event.target.value)
                          }
                          className={adminInputClass}
                          style={{ colorScheme: "dark" }}
                        >
                          <option
                            value=""
                            style={{
                              backgroundColor: "#171322",
                              color: "#ffffff",
                            }}
                          >
                            اختر لعبة
                          </option>

                          {[...products]
                            .sort((first, second) =>
                              first.name.localeCompare(second.name, "ar")
                            )
                            .map((product) => {
                              const currentOffer = offers.find(
                                (offer) => offer.product_id === product.id
                              );

                              return (
                                <option
                                  key={product.id}
                                  value={product.id}
                                  style={{
                                    backgroundColor: "#171322",
                                    color: "#ffffff",
                                  }}
                                >
                                  {product.name}
                                  {!product.is_active ? " — مخفية" : ""}
                                  {currentOffer ? " — يوجد تخفيض" : ""}
                                </option>
                              );
                            })}
                        </select>
                      </AdminField>

                      {selectedDiscountProductId && (
                        <div className="rounded-[18px] border border-violet-400/15 bg-violet-500/[0.07] px-4 py-3">
                          {(() => {
                            const selectedProduct = products.find(
                              (product) =>
                                product.id === selectedDiscountProductId
                            );
                            const selectedOffer = offers.find(
                              (offer) =>
                                offer.product_id ===
                                selectedDiscountProductId
                            );

                            if (!selectedProduct) return null;

                            const automaticDiscount =
                              selectedProduct.old_price &&
                              selectedProduct.old_price >
                                selectedProduct.price
                                ? Math.round(
                                    ((selectedProduct.old_price -
                                      selectedProduct.price) /
                                      selectedProduct.old_price) *
                                      100
                                  )
                                : 0;
                            const shownDiscount =
                              selectedProduct.discount_percent ??
                              automaticDiscount;

                            return (
                              <>
                                <p className="text-xs font-black text-violet-100">
                                  {selectedProduct.name}
                                </p>
                                <p className="mt-1 text-[9px] text-gray-400">
                                  الخصم الأحمر {shownDiscount}%
                                  {selectedOffer
                                    ? " • سيتم تعديل التاريخ الموجود"
                                    : " • سيتم إنشاء تخفيض لهذه اللعبة"}
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      <AdminField label="تاريخ انتهاء التخفيضات">
                        <input
                          type="datetime-local"
                          value={offerEndsAt}
                          onChange={(event) =>
                            setOfferEndsAt(event.target.value)
                          }
                          disabled={!selectedDiscountProductId}
                          className={adminInputClass}
                        />
                      </AdminField>

                      <button
                        type="button"
                        onClick={saveOfferTime}
                        disabled={
                          savingOfferTime ||
                          !selectedDiscountProductId ||
                          !offerEndsAt
                        }
                        className="w-full rounded-[20px] bg-gradient-to-l from-amber-500 to-orange-500 px-5 py-4 text-sm font-black text-black disabled:opacity-50"
                      >
                        {savingOfferTime
                          ? "جاري الحفظ..."
                          : "حفظ تاريخ انتهاء التخفيضات"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-black">
                        التخفيضات الحالية
                      </h3>
                      <span className="text-[9px] text-gray-500">
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
                            className="rounded-[20px] border border-white/10 bg-black/20 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-xs font-black">
                                  {product?.name || offer.title}
                                </p>
                                <p className="mt-1 text-[9px] text-gray-500">
                                  ينتهي: {formatDate(offer.ends_at)}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-black ${
                                  offer.is_active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-300"
                                }`}
                              >
                                {offer.is_active ? "فعال" : "متوقف"}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {!offers.length && (
                        <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-xs text-gray-500">
                          لا توجد تخفيضات حاليًا.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "discountCodes" && (
            <section className="space-y-4">
              <div className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-violet-300">
                      أكواد مستقلة للألعاب
                    </p>
                    <h2 className="mt-1 text-xl font-black">أكواد الخصم</h2>
                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      أنشئ كودًا وحدد نسبته والألعاب التي يظهر لها تحت مؤقت التخفيض.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
                    🎟️
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                  <div className="space-y-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black">
                          {editingDiscountCodeId ? "تعديل الكود" : "إضافة كود جديد"}
                        </h3>
                        <p className="mt-1 text-[10px] text-gray-500">
                          اختر جميع الألعاب أو ألعابًا محددة لهذا الكود.
                        </p>
                      </div>

                      {editingDiscountCodeId && (
                        <button
                          type="button"
                          onClick={resetDiscountCodeForm}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black text-gray-300"
                        >
                          إلغاء التعديل
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <AdminField label="كود الخصم">
                        <input
                          dir="ltr"
                          value={discountCodeText}
                          onChange={(event) =>
                            setDiscountCodeText(event.target.value.toUpperCase())
                          }
                          placeholder="ZETA10"
                          maxLength={30}
                          className={`${adminInputClass} text-left uppercase`}
                        />
                      </AdminField>

                      <AdminField label="نسبة الخصم %">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          value={discountCodePercent}
                          onChange={(event) =>
                            setDiscountCodePercent(event.target.value)
                          }
                          placeholder="10"
                          className={adminInputClass}
                        />
                      </AdminField>
                    </div>

                    <div className="rounded-[18px] border border-violet-400/15 bg-violet-500/[0.06] px-4 py-3">
                      <p className="text-xs font-black text-violet-100">
                        الكود يعمل مباشرة بدون مؤقت
                      </p>
                      <p className="mt-1 text-[9px] leading-5 text-gray-500">
                        أوقف الكود أو احذفه يدويًا وقت ما تبي.
                      </p>
                    </div>

                    <label className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
                      <div>
                        <p className="text-xs font-black">الكود مفعّل</p>
                        <p className="mt-1 text-[9px] text-gray-500">
                          تقدر توقفه وترجعه بدون حذفه.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={discountCodeActive}
                        onChange={(event) =>
                          setDiscountCodeActive(event.target.checked)
                        }
                        className="h-5 w-5 accent-violet-500"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={saveDiscountCode}
                      disabled={savingDiscountCode}
                      className="flex w-full items-center justify-center rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black text-white shadow-xl shadow-violet-950/30 transition active:scale-[0.98] disabled:opacity-50"
                    >
                      {savingDiscountCode
                        ? "جاري الحفظ..."
                        : editingDiscountCodeId
                          ? "حفظ تعديلات الكود"
                          : "إضافة كود الخصم"}
                    </button>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black">الألعاب المخصصة للكود</h3>
                        <p className="mt-1 text-[10px] text-gray-500">
                          اختر الكل أو حدد لعبة واحدة أو عدة ألعاب.
                        </p>
                      </div>
                      <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-[10px] font-black text-violet-200">
                        {discountCodeAppliesToAll
                          ? "جميع الألعاب"
                          : `${discountCodeProductIds.length} محدد`}
                      </span>
                    </div>

                    <div className="mt-4 max-h-[430px] space-y-2 overflow-y-auto pl-1">
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-[18px] border p-3 transition ${
                          discountCodeAppliesToAll
                            ? "border-violet-400/40 bg-violet-500/15"
                            : "border-white/10 bg-black/20 hover:bg-white/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={discountCodeAppliesToAll}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setDiscountCodeAppliesToAll(checked);
                            if (checked) setDiscountCodeProductIds([]);
                          }}
                          className="h-5 w-5 shrink-0 accent-violet-500"
                        />

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl">
                          🎮
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black">الكل</p>
                          <p className="mt-1 text-[9px] text-gray-500">
                            يطبق الكود على جميع الألعاب الحالية والجديدة
                          </p>
                        </div>
                      </label>

                      {products.map((product) => (
                        <label
                          key={product.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-[18px] border p-3 transition ${
                            discountCodeAppliesToAll ||
                            discountCodeProductIds.includes(product.id)
                              ? "border-violet-400/30 bg-violet-500/10"
                              : "border-white/10 bg-black/20 hover:bg-white/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              discountCodeAppliesToAll ||
                              discountCodeProductIds.includes(product.id)
                            }
                            onChange={(event) => {
                              if (discountCodeAppliesToAll) {
                                setDiscountCodeAppliesToAll(false);
                                setDiscountCodeProductIds([product.id]);
                                return;
                              }

                              setDiscountCodeProductIds((current) =>
                                event.target.checked
                                  ? Array.from(new Set([...current, product.id]))
                                  : current.filter((id) => id !== product.id)
                              );
                            }}
                            className="h-5 w-5 shrink-0 accent-violet-500"
                          />

                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-violet-500/10">
                            {product.cover_url ? (
                              <img
                                src={product.cover_url}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                🎮
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-black">
                              {product.name}
                            </p>
                            <p className="mt-1 text-[9px] text-gray-500">
                              {product.is_active ? "ظاهرة في المتجر" : "اللعبة مخفية"}
                            </p>
                          </div>
                        </label>
                      ))}

                      {!products.length && (
                        <div className="rounded-[18px] border border-dashed border-white/10 px-4 py-10 text-center text-xs text-gray-500">
                          لا توجد ألعاب حتى الآن.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black">الأكواد المحفوظة</h2>
                    <p className="mt-1 text-[10px] text-gray-500">
                      عدّل الكود أو أوقفه أو احذفه من هنا.
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-2 text-[10px] text-gray-400">
                    {discountCodes.length} كود
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {discountCodes.map((code) => {
                    const assignedIds = discountCodeProducts
                      .filter((item) => item.discount_code_id === code.id)
                      .map((item) => item.product_id);
                    const assignedNames = products
                      .filter((product) => assignedIds.includes(product.id))
                      .map((product) => product.name);

                    return (
                      <article
                        key={code.id}
                        className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p
                              dir="ltr"
                              className="truncate text-left text-lg font-black tracking-[2px] text-emerald-300"
                            >
                              {code.code}
                            </p>
                            <p className="mt-1 text-xs font-black text-white">
                              خصم {code.discount_percent}%
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1.5 text-[9px] font-black ${
                              code.is_active
                                ? "bg-emerald-500/10 text-emerald-300"
                                : "bg-red-500/10 text-red-300"
                            }`}
                          >
                            {code.is_active ? "مفعّل" : "متوقف"}
                          </span>
                        </div>

                        <div className="mt-3 rounded-[16px] bg-black/20 p-3">
                          <p className="text-[9px] text-gray-500">الألعاب</p>
                          <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-gray-300">
                            {code.applies_to_all
                              ? "جميع الألعاب"
                              : assignedNames.length
                                ? assignedNames.join("، ")
                                : "لا توجد ألعاب مرتبطة"}
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => openDiscountCodeForEdit(code)}
                            className="rounded-[14px] bg-violet-500/15 px-2 py-3 text-[10px] font-black text-violet-200"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleDiscountCodeActive(code)}
                            className="rounded-[14px] bg-amber-500/10 px-2 py-3 text-[10px] font-black text-amber-200"
                          >
                            {code.is_active ? "إيقاف" : "تفعيل"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDiscountCode(code)}
                            className="rounded-[14px] bg-red-500/10 px-2 py-3 text-[10px] font-black text-red-300"
                          >
                            حذف
                          </button>
                        </div>
                      </article>
                    );
                  })}

                  {!discountCodes.length && (
                    <div className="md:col-span-2 rounded-[22px] border border-dashed border-white/10 px-4 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl">
                        🎟️
                      </div>
                      <p className="mt-4 text-sm font-black">لا توجد أكواد خصم</p>
                      <p className="mt-2 text-xs text-gray-500">
                        أضف أول كود من النموذج الموجود فوق.
                      </p>
                    </div>
                  )}
                </div>
              </div>
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

      {productFormOpen && (
        <Modal
          title={editingProduct ? `تعديل ${editingProduct.name}` : "إضافة لعبة جديدة"}
          onClose={() => {
            setProductFormOpen(false);
            resetProductForm();
          }}
        >
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="اسم اللعبة">
                <input
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="مثال: GTA V"
                  className={adminInputClass}
                />
              </AdminField>

              <AdminField label="المنصة أو الوسم العلوي">
                <input
                  value={productPlatform}
                  onChange={(event) => setProductPlatform(event.target.value)}
                  placeholder="Rockstar PC"
                  className={adminInputClass}
                />
              </AdminField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="تصنيف اللعبة أعلى الصفحة">
                <input
                  value={productDetailCategory}
                  onChange={(event) => setProductDetailCategory(event.target.value)}
                  placeholder="عالم مفتوح"
                  className={adminInputClass}
                />
              </AdminField>

              <AdminField label="العبارة الصغيرة على البطاقة">
                <input
                  value={productCardBadge}
                  onChange={(event) => setProductCardBadge(event.target.value)}
                  placeholder="حماية Denuvo"
                  className={adminInputClass}
                />
              </AdminField>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AdminField label="السعر">
                <input type="number" min="0" step="0.01" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className={adminInputClass} />
              </AdminField>
              <AdminField label="السعر القديم">
                <input type="number" min="0" step="0.01" value={productOldPrice} onChange={(event) => setProductOldPrice(event.target.value)} className={adminInputClass} />
              </AdminField>
              <AdminField label="الخصم الأحمر %">
                <input type="number" min="0" max="100" value={productDiscountPercent} onChange={(event) => setProductDiscountPercent(event.target.value)} placeholder="27" className={adminInputClass} />
              </AdminField>
              <AdminField label="عدد مرات الشراء">
                <input type="number" min="0" step="1" value={productSoldCount} onChange={(event) => setProductSoldCount(event.target.value)} className={adminInputClass} />
              </AdminField>
            </div>

            <AdminField label="الوصف تحت اسم اللعبة">
              <textarea
                value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                rows={4}
                placeholder="اكتب وصف اللعبة..."
                className={`${adminInputClass} resize-none leading-7`}
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="نوع الملكية">
                <textarea value={productOwnership} onChange={(event) => setProductOwnership(event.target.value)} rows={3} className={`${adminInputClass} resize-none`} />
              </AdminField>
              <AdminField label="تعليمات الاستخدام">
                <textarea value={productUsage} onChange={(event) => setProductUsage(event.target.value)} rows={3} className={`${adminInputClass} resize-none`} />
              </AdminField>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="نوع اللعبة">
                <select value={productDisplayKind} onChange={(event) => setProductDisplayKind(event.target.value as "featured" | "shared" | "private")} className={adminInputClass}>
                  <option value="featured">نسخة رقمية / مميزة</option>
                  <option value="shared">حساب PC مشترك</option>
                  <option value="private">حساب PC خاص</option>
                </select>
              </AdminField>

              <AdminField label="مكانها في الصفحة الرئيسية">
                <select value={productHomeSection} onChange={(event) => setProductHomeSection(event.target.value as "" | "featured" | "shared" | "private")} className={adminInputClass}>
                  <option value="">لا تظهر في الرئيسية</option>
                  <option value="featured">ألعاب مميزة</option>
                  <option value="shared">ألعاب PC مشتركة</option>
                  <option value="private">ألعاب PC خاصة</option>
                </select>
              </AdminField>

              <AdminField label="المخزون">
                <input type="number" min="0" step="1" value={productStock} onChange={(event) => setProductStock(event.target.value)} className={adminInputClass} />
              </AdminField>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-black">التصنيفات التي تظهر فيها اللعبة</h3>
              <p className="mt-1 text-[10px] text-gray-500">تقدر تختار أكثر من تصنيف.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {homeCategories
                  .filter(
                    (category) =>
                      category.name.trim() !== "الكل"
                  )
                  .map((category) => (
                    <label key={category.id} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/20 p-3 text-xs font-black">
                      <input
                        type="checkbox"
                        checked={productCategoryIds.includes(category.id)}
                        onChange={(event) =>
                          setProductCategoryIds((current) =>
                            event.target.checked
                              ? Array.from(new Set([...current, category.id]))
                              : current.filter((id) => id !== category.id)
                          )
                        }
                      />
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </label>
                  ))}

                {homeCategories.filter(
                  (category) => category.name.trim() !== "الكل"
                ).length === 0 && (
                  <div className="sm:col-span-2 rounded-[16px] border border-dashed border-amber-400/20 bg-amber-500/[0.06] p-4 text-center text-[10px] font-bold leading-6 text-amber-200">
                    لا توجد تصنيفات حاليًا. أضف التصنيفات من قسم الصفحة الرئيسية وستظهر هنا مباشرة.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black">صور اللعبة</h3>
                  <p className="mt-1 text-[10px] leading-5 text-gray-500">
                    أول صورة تكون الغلاف. اضغط زر إضافة الصور أكثر من مرة، وكل صورة جديدة تنضاف مع الصور السابقة.
                  </p>
                </div>

                <span className="shrink-0 rounded-xl bg-violet-500/10 px-3 py-2 text-[10px] font-black text-violet-200">
                  {editingProductImages.length + productNewImages.length} صورة
                </span>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-dashed border-violet-400/30 bg-violet-500/[0.08] px-4 py-4 text-xs font-black text-violet-100 transition hover:bg-violet-500/[0.13]">
                <span className="text-lg">＋</span>
                <span>إضافة صورة أو أكثر</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={(event) => {
                    addProductImageFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-center text-[9px] leading-5 text-gray-500">
                تقدر تختار عدة صور معًا، أو تختار صورة واحدة ثم تضغط الزر مرة ثانية لإضافة صورة أخرى.
              </p>

              {productNewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {productNewImages.map((file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="overflow-hidden rounded-[16px] border border-violet-400/15 bg-violet-500/[0.06]"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-black/30">
                        {productNewImagePreviews[index] && (
                          <img
                            src={productNewImagePreviews[index]}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="p-2.5">
                        <p className="truncate text-[9px] font-black text-violet-100">
                          {editingProductImages.length === 0 && index === 0
                            ? "الغلاف الرئيسي"
                            : `صورة جديدة ${index + 1}`}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeProductNewImage(index)}
                          className="mt-2 w-full rounded-lg bg-red-500/10 px-2 py-2 text-[8px] font-black text-red-300"
                        >
                          إزالة الصورة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editingProductImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-black text-gray-300">
                    الصور المحفوظة
                  </p>
                  {editingProductImages.map((image, index) => (
                    <div key={image.id} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-black/20 p-2">
                      <img src={image.image_url} alt={image.title} className="h-14 w-20 rounded-xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black">{image.title}</p>
                        <p className="mt-1 text-[8px] text-gray-500">{index === 0 ? "الغلاف الرئيسي" : `الصورة ${index + 1}`}</p>
                      </div>
                      <button type="button" disabled={index === 0} onClick={() => moveProductImage(image, "up")} className="rounded-lg bg-white/5 px-2 py-2 text-xs disabled:opacity-30">↑</button>
                      <button type="button" disabled={index === editingProductImages.length - 1} onClick={() => moveProductImage(image, "down")} className="rounded-lg bg-white/5 px-2 py-2 text-xs disabled:opacity-30">↓</button>
                      <button type="button" onClick={() => deleteProductImage(image)} className="rounded-lg bg-red-500/10 px-2 py-2 text-[9px] font-black text-red-300">حذف</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
              <div>
                <p className="text-xs font-black">اللعبة ظاهرة في المتجر</p>
                <p className="mt-1 text-[9px] text-gray-500">عطّلها لإخفائها بدون حذفها.</p>
              </div>
              <input type="checkbox" checked={productActive} onChange={(event) => setProductActive(event.target.checked)} className="h-5 w-5" />
            </label>

            <button
              type="button"
              onClick={saveProduct}
              disabled={savingProduct}
              className="w-full rounded-[20px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black disabled:opacity-50"
            >
              {savingProduct ? "جاري حفظ اللعبة والصور..." : "حفظ اللعبة"}
            </button>
          </div>
        </Modal>
      )}

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
          <div className="rounded-[22px] border border-violet-400/15 bg-violet-500/[0.07] p-4">
            <p className="text-[9px] font-bold text-violet-300">
              المشتري
            </p>
            <h3 className="mt-1 text-base font-black">
              {selectedOrder.customer_name ||
                profiles.find((profile) => profile.id === selectedOrder.user_id)
                  ?.display_name ||
                "بدون اسم"}
            </h3>
            <p dir="ltr" className="mt-2 truncate text-left text-[10px] text-gray-400">
              {selectedOrder.customer_email ||
                profiles.find((profile) => profile.id === selectedOrder.user_id)
                  ?.email ||
                "—"}
            </p>
            <p dir="ltr" className="mt-1 truncate text-left text-[10px] text-gray-500">
              {selectedOrder.customer_phone ||
                profiles.find((profile) => profile.id === selectedOrder.user_id)
                  ?.phone ||
                "—"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { status: "processing" as const, label: "قيد التجهيز" },
              { status: "completed" as const, label: "مكتمل" },
              { status: "cancelled" as const, label: "ملغي" },
            ].map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => void updateOrderStatus(selectedOrder, item.status)}
                disabled={updatingOrderId === selectedOrder.id}
                className={`rounded-2xl border px-2 py-3 text-[9px] font-black transition disabled:opacity-50 ${
                  selectedOrder.status === item.status
                    ? statusClass[item.status]
                    : "border-white/10 bg-white/[0.03] text-gray-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
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
              label="السعر قبل الخصم"
              value={formatMoney(selectedOrder.subtotal)}
            />

            <InfoCard
              label="قيمة الخصم"
              value={formatMoney(selectedOrder.discount_amount)}
            />

            <InfoCard
              label="كود الخصم"
              value={selectedOrder.discount_code || "لم يستخدم كود"}
            />

            <InfoCard
              label="نسبة الكود"
              value={
                selectedOrder.discount_percent
                  ? `${selectedOrder.discount_percent}%`
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
                        الكمية: {item.quantity} • سعر الوحدة: {formatMoney(item.unit_price)}
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

function OverviewCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-black/20 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-bold text-gray-500">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="mt-3 break-words text-lg font-black text-white sm:text-xl">
        {value}
      </p>
      <p className="mt-1 text-[8px] text-gray-600">{hint}</p>
    </div>
  );
}

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