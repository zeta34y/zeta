"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AdminTab =
  | "overview"
  | "orders"
  | "games"
  | "packages"
  | "offers"
  | "discounts"
  | "users"
  | "notifications"
  | "announcement";

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

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Product = {
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
  categories?: { name?: string } | null;
};

type Package = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  sold_count: number;
};

type OrderItem = {
  id: string;
  item_name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: "product" | "package";
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

type AdminOrder = {
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
  order_items?: OrderItem[];
  payments?: Payment[];
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

type DashboardStats = {
  total_orders: number;
  processing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_sales: number;
};

type Offer = {
  id: string;
  title: string;
  product_id: string | null;
  package_id: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
};

type DiscountCode = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  usage_limit: number | null;
  usage_per_user: number;
  used_count: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
};

type Announcement = {
  id: number;
  text: string;
  emoji: string | null;
  link_url: string | null;
  is_visible: boolean;
};

const emptyStats: DashboardStats = {
  total_orders: 0,
  processing_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  total_sales: 0,
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

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value: number | string | null | undefined) {
  return `${toNumber(value).toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
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

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");

  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement>({
    id: 1,
    text: "افتتاح متجر ZETA",
    emoji: "🎉",
    link_url: "",
    is_visible: true,
  });

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productShortDescription, setProductShortDescription] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOldPrice, setProductOldPrice] = useState("");
  const [productStock, setProductStock] = useState("0");
  const [productCategory, setProductCategory] = useState("");
  const [productShared, setProductShared] = useState(false);
  const [productFeatured, setProductFeatured] = useState(false);
  const [productBestSeller, setProductBestSeller] = useState(false);
  const [productActive, setProductActive] = useState(true);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  const [packageFormOpen, setPackageFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packagePrice, setPackagePrice] = useState("");
  const [packageOldPrice, setPackageOldPrice] = useState("");
  const [packageStock, setPackageStock] = useState("0");
  const [packageFeatured, setPackageFeatured] = useState(false);
  const [packageActive, setPackageActive] = useState(true);
  const [packageImage, setPackageImage] = useState<File | null>(null);
  const [packageProducts, setPackageProducts] = useState<string[]>([]);
  const [savingPackage, setSavingPackage] = useState(false);

  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerTargetType, setOfferTargetType] = useState<"product" | "package">("product");
  const [offerTargetId, setOfferTargetId] = useState("");
  const [offerDiscountType, setOfferDiscountType] =
    useState<"percentage" | "fixed">("percentage");
  const [offerDiscountValue, setOfferDiscountValue] = useState("");
  const [offerStartsAt, setOfferStartsAt] = useState("");
  const [offerEndsAt, setOfferEndsAt] = useState("");

  const [discountFormOpen, setDiscountFormOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountType, setDiscountType] =
    useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discountMinimum, setDiscountMinimum] = useState("0");
  const [discountLimit, setDiscountLimit] = useState("");
  const [discountPerUser, setDiscountPerUser] = useState("1");
  const [discountStartsAt, setDiscountStartsAt] = useState("");
  const [discountEndsAt, setDiscountEndsAt] = useState("");

  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationAudience, setNotificationAudience] =
    useState<"all" | "user">("all");
  const [notificationUserId, setNotificationUserId] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

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
    const query = search.trim().toLowerCase();
    if (!query) return profiles;
    return profiles.filter((profile) =>
      [profile.display_name, profile.email, profile.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [profiles, search]);

  useEffect(() => {
    let mounted = true;

    async function verifyAdmin() {
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

        const isAdmin = currentUser.app_metadata?.role === "admin";
        if (!isAdmin) {
          router.replace("/");
          return;
        }

        if (!mounted) return;
        setUser(currentUser);
        setAuthorized(true);
        await loadAllData();
      } catch (error) {
        console.error(error);
        router.replace("/");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    verifyAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function loadAllData() {
    setRefreshing(true);
    setErrorMessage("");

    try {
      const [
        statsResult,
        ordersResult,
        productsResult,
        packagesResult,
        categoriesResult,
        profilesResult,
        offersResult,
        discountsResult,
        announcementResult,
      ] = await Promise.all([
        supabase.from("admin_dashboard_stats").select("*").single(),
        supabase
          .from("orders")
          .select(
            "*, order_items(*), payments(*)"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("*, categories(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("packages")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("offers")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("discount_codes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("announcement_bar")
          .select("*")
          .eq("id", 1)
          .single(),
      ]);

      const possibleErrors = [
        statsResult.error,
        ordersResult.error,
        productsResult.error,
        packagesResult.error,
        categoriesResult.error,
        profilesResult.error,
        offersResult.error,
        discountsResult.error,
        announcementResult.error,
      ].filter(Boolean);

      if (possibleErrors.length) {
        throw possibleErrors[0];
      }

      if (statsResult.data) {
        setStats({
          total_orders: toNumber(statsResult.data.total_orders),
          processing_orders: toNumber(statsResult.data.processing_orders),
          completed_orders: toNumber(statsResult.data.completed_orders),
          cancelled_orders: toNumber(statsResult.data.cancelled_orders),
          total_sales: toNumber(statsResult.data.total_sales),
        });
      }

      setOrders((ordersResult.data ?? []) as AdminOrder[]);
      setProducts((productsResult.data ?? []) as Product[]);
      setPackages((packagesResult.data ?? []) as Package[]);
      setCategories((categoriesResult.data ?? []) as Category[]);
      setProfiles((profilesResult.data ?? []) as Profile[]);
      setOffers((offersResult.data ?? []) as Offer[]);
      setDiscounts((discountsResult.data ?? []) as DiscountCode[]);

      if (announcementResult.data) {
        setAnnouncement(announcementResult.data as Announcement);
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

  function notify(value: string) {
    setMessage(value);
    window.setTimeout(() => setMessage(""), 2400);
  }

  async function uploadImage(file: File, folder: string) {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async function updateOrderStatus(order: AdminOrder, status: OrderStatus) {
    const updates: Record<string, unknown> = { status };

    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    if (status === "cancelled") {
      const reason = window.prompt("اكتب سبب إلغاء الطلب:");
      if (!reason) return;
      updates.cancellation_reason = reason;
    }

    if (status === "rejected") {
      const reason = window.prompt("اكتب سبب رفض الطلب:");
      if (!reason) return;
      updates.rejection_reason = reason;
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    notify("تم تحديث حالة الطلب");
    setSelectedOrder(null);
    await loadAllData();
  }

  function resetProductForm() {
    setEditingProduct(null);
    setProductName("");
    setProductShortDescription("");
    setProductDescription("");
    setProductPrice("");
    setProductOldPrice("");
    setProductStock("0");
    setProductCategory(categories[0]?.id ?? "");
    setProductShared(false);
    setProductFeatured(false);
    setProductBestSeller(false);
    setProductActive(true);
    setProductImage(null);
  }

  function openProductForm(product?: Product) {
    resetProductForm();

    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductShortDescription(product.short_description ?? "");
      setProductDescription(product.description ?? "");
      setProductPrice(String(product.price));
      setProductOldPrice(product.old_price ? String(product.old_price) : "");
      setProductStock(String(product.stock));
      setProductCategory(product.category_id ?? "");
      setProductShared(product.is_shared);
      setProductFeatured(product.is_featured);
      setProductBestSeller(product.is_best_seller_manual);
      setProductActive(product.is_active);
    }

    setProductFormOpen(true);
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!productName.trim() || !productPrice) return;

    setSavingProduct(true);
    setErrorMessage("");

    try {
      let coverUrl = editingProduct?.cover_url ?? null;

      if (productImage) {
        coverUrl = await uploadImage(productImage, "products");
      }

      const payload = {
        category_id: productCategory || null,
        name: productName.trim(),
        slug: editingProduct?.slug || `${makeSlug(productName)}-${Date.now()}`,
        short_description: productShortDescription.trim() || null,
        description: productDescription.trim() || null,
        cover_url: coverUrl,
        price: toNumber(productPrice),
        old_price: productOldPrice ? toNumber(productOldPrice) : null,
        stock: Math.max(0, Math.floor(toNumber(productStock))),
        platform: "PC",
        is_shared: productShared,
        is_featured: productFeatured,
        is_best_seller_manual: productBestSeller,
        is_active: productActive,
        created_by: user?.id ?? null,
      };

      const query = editingProduct
        ? supabase.from("products").update(payload).eq("id", editingProduct.id)
        : supabase.from("products").insert(payload);

      const { error } = await query;
      if (error) throw error;

      setProductFormOpen(false);
      resetProductForm();
      notify(editingProduct ? "تم تعديل اللعبة" : "تمت إضافة اللعبة");
      await loadAllData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر حفظ اللعبة"
      );
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`حذف لعبة ${product.name}؟`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    notify("تم حذف اللعبة");
    await loadAllData();
  }

  function resetPackageForm() {
    setEditingPackage(null);
    setPackageName("");
    setPackageDescription("");
    setPackagePrice("");
    setPackageOldPrice("");
    setPackageStock("0");
    setPackageFeatured(false);
    setPackageActive(true);
    setPackageImage(null);
    setPackageProducts([]);
  }

  async function openPackageForm(pkg?: Package) {
    resetPackageForm();

    if (pkg) {
      setEditingPackage(pkg);
      setPackageName(pkg.name);
      setPackageDescription(pkg.description ?? "");
      setPackagePrice(String(pkg.price));
      setPackageOldPrice(pkg.old_price ? String(pkg.old_price) : "");
      setPackageStock(String(pkg.stock));
      setPackageFeatured(pkg.is_featured);
      setPackageActive(pkg.is_active);

      const { data } = await supabase
        .from("package_items")
        .select("product_id")
        .eq("package_id", pkg.id);

      setPackageProducts((data ?? []).map((item) => item.product_id));
    }

    setPackageFormOpen(true);
  }

  async function savePackage(event: FormEvent) {
    event.preventDefault();
    if (!packageName.trim() || !packagePrice) return;

    setSavingPackage(true);
    setErrorMessage("");

    try {
      let imageUrl = editingPackage?.image_url ?? null;

      if (packageImage) {
        imageUrl = await uploadImage(packageImage, "packages");
      }

      const payload = {
        name: packageName.trim(),
        slug: editingPackage?.slug || `${makeSlug(packageName)}-${Date.now()}`,
        description: packageDescription.trim() || null,
        image_url: imageUrl,
        price: toNumber(packagePrice),
        old_price: packageOldPrice ? toNumber(packageOldPrice) : null,
        stock: Math.max(0, Math.floor(toNumber(packageStock))),
        is_featured: packageFeatured,
        is_active: packageActive,
        created_by: user?.id ?? null,
      };

      let packageId = editingPackage?.id;

      if (editingPackage) {
        const { error } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", editingPackage.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("packages")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        packageId = data.id;
      }

      if (!packageId) throw new Error("تعذر إنشاء البكج");

      await supabase
        .from("package_items")
        .delete()
        .eq("package_id", packageId);

      if (packageProducts.length) {
        const { error } = await supabase.from("package_items").insert(
          packageProducts.map((productId) => ({
            package_id: packageId,
            product_id: productId,
            quantity: 1,
          }))
        );

        if (error) throw error;
      }

      setPackageFormOpen(false);
      resetPackageForm();
      notify(editingPackage ? "تم تعديل البكج" : "تمت إضافة البكج");
      await loadAllData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "تعذر حفظ البكج"
      );
    } finally {
      setSavingPackage(false);
    }
  }

  async function deletePackage(pkg: Package) {
    if (!window.confirm(`حذف بكج ${pkg.name}؟`)) return;

    const { error } = await supabase
      .from("packages")
      .delete()
      .eq("id", pkg.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    notify("تم حذف البكج");
    await loadAllData();
  }

  async function saveOffer(event: FormEvent) {
    event.preventDefault();

    const payload = {
      title: offerTitle.trim(),
      product_id: offerTargetType === "product" ? offerTargetId : null,
      package_id: offerTargetType === "package" ? offerTargetId : null,
      discount_type: offerDiscountType,
      discount_value: toNumber(offerDiscountValue),
      starts_at: offerStartsAt
        ? new Date(offerStartsAt).toISOString()
        : new Date().toISOString(),
      ends_at: offerEndsAt ? new Date(offerEndsAt).toISOString() : null,
      is_active: true,
    };

    const { error } = await supabase.from("offers").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setOfferFormOpen(false);
    setOfferTitle("");
    setOfferTargetId("");
    setOfferDiscountValue("");
    setOfferStartsAt("");
    setOfferEndsAt("");
    notify("تمت إضافة العرض");
    await loadAllData();
  }

  async function toggleOffer(offer: Offer) {
    const { error } = await supabase
      .from("offers")
      .update({ is_active: !offer.is_active })
      .eq("id", offer.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadAllData();
  }

  async function saveDiscount(event: FormEvent) {
    event.preventDefault();

    const payload = {
      code: discountCode.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: toNumber(discountValue),
      minimum_order: toNumber(discountMinimum),
      usage_limit: discountLimit ? Math.floor(toNumber(discountLimit)) : null,
      usage_per_user: Math.max(1, Math.floor(toNumber(discountPerUser))),
      starts_at: discountStartsAt
        ? new Date(discountStartsAt).toISOString()
        : new Date().toISOString(),
      ends_at: discountEndsAt
        ? new Date(discountEndsAt).toISOString()
        : null,
      is_active: true,
    };

    const { error } = await supabase
      .from("discount_codes")
      .insert(payload);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setDiscountFormOpen(false);
    setDiscountCode("");
    setDiscountValue("");
    setDiscountMinimum("0");
    setDiscountLimit("");
    setDiscountPerUser("1");
    setDiscountStartsAt("");
    setDiscountEndsAt("");
    notify("تم إنشاء كود الخصم");
    await loadAllData();
  }

  async function toggleDiscount(discount: DiscountCode) {
    const { error } = await supabase
      .from("discount_codes")
      .update({ is_active: !discount.is_active })
      .eq("id", discount.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadAllData();
  }

  async function openUserDetails(profile: Profile) {
    setSelectedUser(profile);

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSelectedUserOrders((data ?? []) as AdminOrder[]);
  }

  async function sendNotification(event: FormEvent) {
    event.preventDefault();
    setSendingNotification(true);

    const { error } = await supabase.from("notifications").insert({
      title: notificationTitle.trim(),
      body: notificationBody.trim(),
      audience: notificationAudience,
      target_user_id:
        notificationAudience === "user" ? notificationUserId : null,
      created_by: user?.id ?? null,
      is_active: true,
    });

    setSendingNotification(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotificationTitle("");
    setNotificationBody("");
    setNotificationAudience("all");
    setNotificationUserId("");
    notify("تم إرسال الإشعار");
  }

  async function saveAnnouncement() {
    const { error } = await supabase
      .from("announcement_bar")
      .update({
        text: announcement.text,
        emoji: announcement.emoji,
        link_url: announcement.link_url || null,
        is_visible: announcement.is_visible,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    notify("تم حفظ الشريط العلوي");
    await loadAllData();
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-500" />
          <p className="mt-4 text-sm text-gray-400">
            جاري تحميل لوحة الإدارة...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized || !user) return null;

  const navItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: "overview", label: "نظرة عامة", icon: "📊" },
    { id: "orders", label: "الطلبات", icon: "📦" },
    { id: "games", label: "الألعاب", icon: "🎮" },
    { id: "packages", label: "البكجات", icon: "🎁" },
    { id: "offers", label: "العروض", icon: "🔥" },
    { id: "discounts", label: "أكواد الخصم", icon: "🎟️" },
    { id: "users", label: "المستخدمون", icon: "👥" },
    { id: "notifications", label: "الإشعارات", icon: "🔔" },
    { id: "announcement", label: "الشريط العلوي", icon: "📢" },
  ];

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#08070d] pb-10 text-white"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 top-0 h-[430px] w-[430px] rounded-full bg-amber-700/10 blur-[130px]" />
        <div className="absolute -left-32 top-[520px] h-[380px] w-[380px] rounded-full bg-violet-700/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08070d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-lg shadow-lg">
              ⚙️
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-amber-400">لوحة الإدارة</p>
              <h1 className="truncate text-base font-black sm:text-lg">
                إدارة متجر ZETA
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadAllData}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm"
              aria-label="تحديث"
            >
              {refreshing ? "…" : "↻"}
            </button>
            <Link
              href="/"
              className="flex h-10 items-center rounded-2xl border border-white/10 bg-white/5 px-3 text-[10px] font-black"
            >
              المتجر
            </Link>
            <button
              type="button"
              onClick={logout}
              className="hidden h-10 rounded-2xl border border-red-400/15 bg-red-500/10 px-3 text-[10px] font-black text-red-300 sm:block"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-[26px] border border-white/[0.07] bg-[#121019] p-3 lg:sticky lg:top-24">
          <div className="rounded-[20px] border border-amber-400/15 bg-amber-500/10 p-3">
            <p className="text-[9px] text-amber-400">مسجل كإداري</p>
            <h2 className="mt-1 truncate text-sm font-black">{adminName}</h2>
            <p dir="ltr" className="mt-1 truncate text-left text-[9px] text-gray-500">
              {user.email}
            </p>
          </div>

          <nav className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center text-[9px] font-black transition lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-3 lg:text-xs ${
                  tab === item.id
                    ? "bg-amber-500/15 text-amber-200"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          {errorMessage && (
            <div className="mb-4 rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              {errorMessage}
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="mr-3 text-white"
              >
                ×
              </button>
            </div>
          )}

          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: "إجمالي الطلبات", value: stats.total_orders, icon: "📦" },
                  { label: "قيد التجهيز", value: stats.processing_orders, icon: "⚙️" },
                  { label: "طلبات مكتملة", value: stats.completed_orders, icon: "✓" },
                  {
                    label: "إجمالي المبيعات",
                    value: formatMoney(stats.total_sales),
                    icon: "💰",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-white/[0.07] bg-[#121019] p-4"
                  >
                    <span className="text-2xl">{card.icon}</span>
                    <p className="mt-3 text-xl font-black">{card.value}</p>
                    <p className="mt-1 text-[10px] text-gray-500">{card.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Panel title="أحدث الطلبات" subtitle="آخر العمليات الحقيقية">
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <button
                        type="button"
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="flex w-full items-center justify-between gap-3 rounded-[20px] border border-white/[0.06] bg-black/20 p-3 text-right"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {order.order_number}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-gray-500">
                            {order.customer_name || order.customer_email || "مستخدم"}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black">{formatMoney(order.total)}</p>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[8px] font-black ${statusClass[order.status]}`}
                          >
                            {statusLabel[order.status]}
                          </span>
                        </div>
                      </button>
                    ))}
                    {!orders.length && <EmptyText text="لا توجد طلبات حتى الآن" />}
                  </div>
                </Panel>

                <Panel title="الأكثر مبيعًا" subtitle="حسب عدد المبيعات الحقيقي">
                  <div className="space-y-3">
                    {[...products]
                      .sort((a, b) => b.sold_count - a.sold_count)
                      .slice(0, 5)
                      .map((product, index) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 rounded-[20px] border border-white/[0.06] bg-black/20 p-3"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-black text-amber-300">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">{product.name}</p>
                            <p className="mt-1 text-[10px] text-gray-500">
                              {product.sold_count} عملية بيع
                            </p>
                          </div>
                          <p className="text-xs font-black">
                            {formatMoney(product.price)}
                          </p>
                        </div>
                      ))}
                    {!products.length && <EmptyText text="أضف ألعابًا لعرض الأكثر مبيعًا" />}
                  </div>
                </Panel>
              </div>
            </>
          )}

          {tab === "orders" && (
            <Panel title="جميع الطلبات" subtitle={`${orders.length} طلب`}>
              <div className="space-y-3">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[22px] border border-white/[0.07] bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black">{order.order_number}</p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          {order.customer_name || "بدون اسم"} • {formatDate(order.created_at)}
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          {order.payment_method
                            ? paymentMethodLabel[order.payment_method] || order.payment_method
                            : "طريقة الدفع غير محددة"}
                          {" • "}
                          {paymentStatusLabel[order.payment_status]}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black">{formatMoney(order.total)}</p>
                        <span
                          className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[8px] font-black ${statusClass[order.status]}`}
                        >
                          {statusLabel[order.status]}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="mt-4 w-full rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-xs font-black text-violet-200"
                    >
                      عرض تفاصيل الطلب
                    </button>
                  </article>
                ))}
                {!orders.length && <EmptyText text="لا توجد طلبات" />}
              </div>
            </Panel>
          )}

          {tab === "games" && (
            <Panel
              title="إدارة الألعاب"
              subtitle={`${products.length} لعبة`}
              action={
                <button
                  type="button"
                  onClick={() => openProductForm()}
                  className="rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-3 text-xs font-black"
                >
                  إضافة لعبة
                </button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-black/20"
                  >
                    <div className="aspect-[16/9] bg-white/5">
                      {product.cover_url ? (
                        <img
                          src={product.cover_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🎮</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black">{product.name}</h3>
                          <p className="mt-1 text-[10px] text-gray-500">
                            {product.categories?.name || "بدون تصنيف"}
                          </p>
                        </div>
                        <p className="text-sm font-black">{formatMoney(product.price)}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {product.is_shared && <Tag text="مشتركة" />}
                        {product.is_featured && <Tag text="مميزة" />}
                        {product.is_best_seller_manual && <Tag text="الأكثر مبيعًا" />}
                        <Tag text={product.is_active ? "ظاهرة" : "مخفية"} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openProductForm(product)}
                          className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-[10px] font-black text-violet-200"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(product)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-[10px] font-black text-red-300"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {!products.length && <EmptyText text="لا توجد ألعاب، أضف أول لعبة" />}
              </div>
            </Panel>
          )}

          {tab === "packages" && (
            <Panel
              title="إدارة البكجات"
              subtitle={`${packages.length} بكج`}
              action={
                <button
                  type="button"
                  onClick={() => openPackageForm()}
                  className="rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-3 text-xs font-black"
                >
                  إضافة بكج
                </button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {packages.map((pkg) => (
                  <article
                    key={pkg.id}
                    className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-black/20"
                  >
                    <div className="aspect-[16/9] bg-white/5">
                      {pkg.image_url ? (
                        <img
                          src={pkg.image_url}
                          alt={pkg.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">🎁</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black">{pkg.name}</h3>
                          <p className="mt-1 text-[10px] text-gray-500">
                            المخزون: {pkg.stock}
                          </p>
                        </div>
                        <p className="text-sm font-black">{formatMoney(pkg.price)}</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openPackageForm(pkg)}
                          className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2.5 text-[10px] font-black text-violet-200"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePackage(pkg)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2.5 text-[10px] font-black text-red-300"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {!packages.length && <EmptyText text="لا توجد بكجات" />}
              </div>
            </Panel>
          )}

          {tab === "offers" && (
            <Panel
              title="العروض"
              subtitle="خصومات على لعبة أو بكج"
              action={
                <button
                  type="button"
                  onClick={() => setOfferFormOpen(true)}
                  className="rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-3 text-xs font-black"
                >
                  إضافة عرض
                </button>
              }
            >
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/[0.07] bg-black/20 p-4"
                  >
                    <div>
                      <p className="text-sm font-black">{offer.title}</p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {offer.discount_type === "percentage"
                          ? `${offer.discount_value}%`
                          : formatMoney(offer.discount_value)}
                        {" • "}
                        ينتهي {formatDate(offer.ends_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleOffer(offer)}
                      className={`rounded-xl px-3 py-2 text-[10px] font-black ${
                        offer.is_active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {offer.is_active ? "مفعّل" : "متوقف"}
                    </button>
                  </div>
                ))}
                {!offers.length && <EmptyText text="لا توجد عروض" />}
              </div>
            </Panel>
          )}

          {tab === "discounts" && (
            <Panel
              title="أكواد الخصم"
              subtitle="إنشاء وتشغيل وإيقاف الأكواد"
              action={
                <button
                  type="button"
                  onClick={() => setDiscountFormOpen(true)}
                  className="rounded-2xl bg-gradient-to-l from-amber-500 to-orange-600 px-4 py-3 text-xs font-black"
                >
                  إضافة كود
                </button>
              }
            >
              <div className="space-y-3">
                {discounts.map((discount) => (
                  <div
                    key={discount.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/[0.07] bg-black/20 p-4"
                  >
                    <div>
                      <p dir="ltr" className="text-left text-sm font-black tracking-wider">
                        {discount.code}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {discount.discount_type === "percentage"
                          ? `${discount.discount_value}%`
                          : formatMoney(discount.discount_value)}
                        {" • "}
                        مستخدم {discount.used_count} مرة
                        {" • "}
                        ينتهي {formatDate(discount.ends_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDiscount(discount)}
                      className={`rounded-xl px-3 py-2 text-[10px] font-black ${
                        discount.is_active
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {discount.is_active ? "مفعّل" : "متوقف"}
                    </button>
                  </div>
                ))}
                {!discounts.length && <EmptyText text="لا توجد أكواد خصم" />}
              </div>
            </Panel>
          )}

          {tab === "users" && (
            <Panel title="المستخدمون" subtitle={`${profiles.length} مستخدم`}>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم أو البريد أو الجوال"
                className="mb-4 w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm outline-none focus:border-violet-400/50"
              />

              <div className="space-y-3">
                {filteredProfiles.map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    onClick={() => openUserDetails(profile)}
                    className="flex w-full items-center gap-3 rounded-[20px] border border-white/[0.07] bg-black/20 p-3 text-right"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-violet-500/10 text-sm font-black">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.display_name || "مستخدم"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        (profile.display_name || profile.email || "م").charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {profile.display_name || "بدون اسم"}
                      </p>
                      <p dir="ltr" className="mt-1 truncate text-left text-[10px] text-gray-500">
                        {profile.email || profile.phone || "—"}
                      </p>
                    </div>
                    <span className="text-gray-500">←</span>
                  </button>
                ))}
                {!filteredProfiles.length && <EmptyText text="لا توجد نتائج" />}
              </div>
            </Panel>
          )}

          {tab === "notifications" && (
            <Panel title="إنشاء إشعار" subtitle="يرسل داخل صفحة الإشعارات">
              <form onSubmit={sendNotification} className="space-y-4">
                <Field label="عنوان الإشعار">
                  <input
                    value={notificationTitle}
                    onChange={(event) => setNotificationTitle(event.target.value)}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="نص الإشعار">
                  <textarea
                    value={notificationBody}
                    onChange={(event) => setNotificationBody(event.target.value)}
                    required
                    rows={5}
                    className={inputClass}
                  />
                </Field>

                <Field label="المستلم">
                  <select
                    value={notificationAudience}
                    onChange={(event) =>
                      setNotificationAudience(event.target.value as "all" | "user")
                    }
                    className={inputClass}
                  >
                    <option value="all">كل المستخدمين</option>
                    <option value="user">مستخدم محدد</option>
                  </select>
                </Field>

                {notificationAudience === "user" && (
                  <Field label="اختر المستخدم">
                    <select
                      value={notificationUserId}
                      onChange={(event) => setNotificationUserId(event.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="">اختر مستخدمًا</option>
                      {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.display_name || profile.email || profile.phone}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                <button
                  type="submit"
                  disabled={sendingNotification}
                  className="w-full rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black disabled:opacity-50"
                >
                  {sendingNotification ? "جاري الإرسال..." : "إرسال الإشعار"}
                </button>
              </form>
            </Panel>
          )}

          {tab === "announcement" && (
            <Panel title="الشريط العلوي" subtitle="تحكم في النص والظهور">
              <div className="space-y-4">
                <Field label="الإيموجي">
                  <input
                    value={announcement.emoji || ""}
                    onChange={(event) =>
                      setAnnouncement((current) => ({
                        ...current,
                        emoji: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="النص">
                  <input
                    value={announcement.text}
                    onChange={(event) =>
                      setAnnouncement((current) => ({
                        ...current,
                        text: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="الرابط عند الضغط (اختياري)">
                  <input
                    dir="ltr"
                    value={announcement.link_url || ""}
                    onChange={(event) =>
                      setAnnouncement((current) => ({
                        ...current,
                        link_url: event.target.value,
                      }))
                    }
                    className={`${inputClass} text-left`}
                  />
                </Field>

                <label className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="text-xs font-black">إظهار الشريط</span>
                  <input
                    type="checkbox"
                    checked={announcement.is_visible}
                    onChange={(event) =>
                      setAnnouncement((current) => ({
                        ...current,
                        is_visible: event.target.checked,
                      }))
                    }
                    className="h-5 w-5"
                  />
                </label>

                <button
                  type="button"
                  onClick={saveAnnouncement}
                  className="w-full rounded-[18px] bg-gradient-to-l from-violet-600 to-fuchsia-600 px-5 py-4 text-sm font-black"
                >
                  حفظ الشريط
                </button>
              </div>
            </Panel>
          )}
        </div>
      </section>

      {selectedOrder && (
        <Modal title={`تفاصيل الطلب ${selectedOrder.order_number}`} onClose={() => setSelectedOrder(null)}>
          <div className="space-y-4">
            <InfoGrid
              items={[
                ["العميل", selectedOrder.customer_name || "—"],
                ["البريد", selectedOrder.customer_email || "—"],
                ["الجوال", selectedOrder.customer_phone || "—"],
                ["تاريخ الطلب", formatDate(selectedOrder.created_at)],
                ["طريقة الدفع", selectedOrder.payment_method ? paymentMethodLabel[selectedOrder.payment_method] || selectedOrder.payment_method : "—"],
                ["حالة الدفع", paymentStatusLabel[selectedOrder.payment_status]],
                ["الإجمالي", formatMoney(selectedOrder.total)],
                ["الخصم", formatMoney(selectedOrder.discount_amount)],
              ]}
            />

            <div>
              <p className="mb-2 text-xs font-black text-gray-300">محتويات الطلب</p>
              <div className="space-y-2">
                {(selectedOrder.order_items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div>
                      <p className="text-xs font-black">{item.item_name}</p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        الكمية: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-black">{formatMoney(item.total_price)}</p>
                  </div>
                ))}
                {!selectedOrder.order_items?.length && <EmptyText text="لا توجد عناصر مسجلة" />}
              </div>
            </div>

            {(selectedOrder.payments ?? []).map((payment) => (
              <div
                key={payment.id}
                className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-xs font-black">تفاصيل عملية الدفع</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-[10px] text-gray-400">
                  <p>رقم العملية: {payment.transaction_id || "—"}</p>
                  <p>المزود: {payment.provider || "—"}</p>
                  <p>الحالة: {paymentStatusLabel[payment.status]}</p>
                  <p>وقت الدفع: {formatDate(payment.paid_at)}</p>
                </div>
              </div>
            ))}

            {selectedOrder.rejection_reason && (
              <ReasonBox title="سبب الرفض" value={selectedOrder.rejection_reason} />
            )}
            {selectedOrder.cancellation_reason && (
              <ReasonBox title="سبب الإلغاء" value={selectedOrder.cancellation_reason} />
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  "processing",
                  "delivered",
                  "completed",
                  "cancelled",
                  "rejected",
                  "refunded",
                ] as OrderStatus[]
              ).map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => updateOrderStatus(selectedOrder, status)}
                  className={`rounded-xl border px-3 py-3 text-[9px] font-black ${statusClass[status]}`}
                >
                  {statusLabel[status]}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {selectedUser && (
        <Modal title="بيانات المستخدم" onClose={() => setSelectedUser(null)}>
          <InfoGrid
            items={[
              ["الاسم", selectedUser.display_name || "—"],
              ["البريد", selectedUser.email || "—"],
              ["الجوال", selectedUser.phone || "—"],
              ["تاريخ التسجيل", formatDate(selectedUser.created_at)],
              ["آخر دخول", formatDate(selectedUser.last_sign_in_at)],
              ["عدد الطلبات", String(selectedUserOrders.length)],
              [
                "إجمالي المشتريات",
                formatMoney(
                  selectedUserOrders
                    .filter((order) => order.payment_status === "paid")
                    .reduce((total, order) => total + toNumber(order.total), 0)
                ),
              ],
            ]}
          />

          <div className="mt-4 space-y-2">
            <p className="text-xs font-black text-gray-300">طلبات المستخدم</p>
            {selectedUserOrders.map((order) => (
              <button
                type="button"
                key={order.id}
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedOrder(order);
                }}
                className="flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.03] p-3 text-right"
              >
                <div>
                  <p className="text-xs font-black">{order.order_number}</p>
                  <p className="mt-1 text-[9px] text-gray-500">
                    {statusLabel[order.status]}
                  </p>
                </div>
                <p className="text-xs font-black">{formatMoney(order.total)}</p>
              </button>
            ))}
            {!selectedUserOrders.length && <EmptyText text="لا توجد طلبات لهذا المستخدم" />}
          </div>
        </Modal>
      )}

      {productFormOpen && (
        <Modal
          title={editingProduct ? "تعديل اللعبة" : "إضافة لعبة"}
          onClose={() => setProductFormOpen(false)}
        >
          <form onSubmit={saveProduct} className="space-y-4">
            <Field label="اسم اللعبة">
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                required
                className={inputClass}
              />
            </Field>

            <Field label="التصنيف">
              <select
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value)}
                className={inputClass}
              >
                <option value="">بدون تصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="الوصف القصير تحت اللعبة">
              <input
                value={productShortDescription}
                onChange={(event) => setProductShortDescription(event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="الوصف الكامل">
              <textarea
                value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                rows={5}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="السعر">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(event) => setProductPrice(event.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="السعر القديم">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productOldPrice}
                  onChange={(event) => setProductOldPrice(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="المخزون">
              <input
                type="number"
                min="0"
                value={productStock}
                onChange={(event) => setProductStock(event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="صورة اللعبة">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setProductImage(event.target.files?.[0] ?? null)}
                className={inputClass}
              />
            </Field>

            <Toggle label="لعبة مشتركة" checked={productShared} onChange={setProductShared} />
            <Toggle label="تظهر في الرئيسية" checked={productFeatured} onChange={setProductFeatured} />
            <Toggle label="تظهر في الأكثر مبيعًا" checked={productBestSeller} onChange={setProductBestSeller} />
            <Toggle label="اللعبة ظاهرة" checked={productActive} onChange={setProductActive} />

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full rounded-[18px] bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-4 text-sm font-black disabled:opacity-50"
            >
              {savingProduct ? "جاري الحفظ..." : "حفظ اللعبة"}
            </button>
          </form>
        </Modal>
      )}

      {packageFormOpen && (
        <Modal
          title={editingPackage ? "تعديل البكج" : "إضافة بكج"}
          onClose={() => setPackageFormOpen(false)}
        >
          <form onSubmit={savePackage} className="space-y-4">
            <Field label="اسم البكج">
              <input
                value={packageName}
                onChange={(event) => setPackageName(event.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="الوصف">
              <textarea
                value={packageDescription}
                onChange={(event) => setPackageDescription(event.target.value)}
                rows={4}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="السعر">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={packagePrice}
                  onChange={(event) => setPackagePrice(event.target.value)}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="السعر القديم">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={packageOldPrice}
                  onChange={(event) => setPackageOldPrice(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="المخزون">
              <input
                type="number"
                min="0"
                value={packageStock}
                onChange={(event) => setPackageStock(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="صورة البكج">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setPackageImage(event.target.files?.[0] ?? null)}
                className={inputClass}
              />
            </Field>

            <Field label="اختر الألعاب داخل البكج">
              <div className="max-h-56 space-y-2 overflow-y-auto rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-white/5"
                  >
                    <span className="text-xs">{product.name}</span>
                    <input
                      type="checkbox"
                      checked={packageProducts.includes(product.id)}
                      onChange={(event) =>
                        setPackageProducts((current) =>
                          event.target.checked
                            ? [...current, product.id]
                            : current.filter((id) => id !== product.id)
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            </Field>

            <Toggle label="بكج مميز" checked={packageFeatured} onChange={setPackageFeatured} />
            <Toggle label="البكج ظاهر" checked={packageActive} onChange={setPackageActive} />

            <button
              type="submit"
              disabled={savingPackage}
              className="w-full rounded-[18px] bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-4 text-sm font-black disabled:opacity-50"
            >
              {savingPackage ? "جاري الحفظ..." : "حفظ البكج"}
            </button>
          </form>
        </Modal>
      )}

      {offerFormOpen && (
        <Modal title="إضافة عرض" onClose={() => setOfferFormOpen(false)}>
          <form onSubmit={saveOffer} className="space-y-4">
            <Field label="اسم العرض">
              <input
                value={offerTitle}
                onChange={(event) => setOfferTitle(event.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <Field label="نوع الهدف">
              <select
                value={offerTargetType}
                onChange={(event) => {
                  setOfferTargetType(event.target.value as "product" | "package");
                  setOfferTargetId("");
                }}
                className={inputClass}
              >
                <option value="product">لعبة</option>
                <option value="package">بكج</option>
              </select>
            </Field>
            <Field label={offerTargetType === "product" ? "اختر اللعبة" : "اختر البكج"}>
              <select
                value={offerTargetId}
                onChange={(event) => setOfferTargetId(event.target.value)}
                required
                className={inputClass}
              >
                <option value="">اختر</option>
                {(offerTargetType === "product" ? products : packages).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="نوع الخصم">
              <select
                value={offerDiscountType}
                onChange={(event) =>
                  setOfferDiscountType(event.target.value as "percentage" | "fixed")
                }
                className={inputClass}
              >
                <option value="percentage">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </Field>
            <Field label="قيمة الخصم">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={offerDiscountValue}
                onChange={(event) => setOfferDiscountValue(event.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="يبدأ">
                <input
                  type="datetime-local"
                  value={offerStartsAt}
                  onChange={(event) => setOfferStartsAt(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="ينتهي">
                <input
                  type="datetime-local"
                  value={offerEndsAt}
                  onChange={(event) => setOfferEndsAt(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <button
              type="submit"
              className="w-full rounded-[18px] bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-4 text-sm font-black"
            >
              حفظ العرض
            </button>
          </form>
        </Modal>
      )}

      {discountFormOpen && (
        <Modal title="إضافة كود خصم" onClose={() => setDiscountFormOpen(false)}>
          <form onSubmit={saveDiscount} className="space-y-4">
            <Field label="الكود">
              <input
                dir="ltr"
                value={discountCode}
                onChange={(event) => setDiscountCode(event.target.value.toUpperCase())}
                required
                className={`${inputClass} text-left`}
              />
            </Field>
            <Field label="نوع الخصم">
              <select
                value={discountType}
                onChange={(event) =>
                  setDiscountType(event.target.value as "percentage" | "fixed")
                }
                className={inputClass}
              >
                <option value="percentage">نسبة مئوية</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </Field>
            <Field label="قيمة الخصم">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                required
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الحد الأدنى">
                <input
                  type="number"
                  min="0"
                  value={discountMinimum}
                  onChange={(event) => setDiscountMinimum(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="عدد الاستخدامات">
                <input
                  type="number"
                  min="1"
                  value={discountLimit}
                  onChange={(event) => setDiscountLimit(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="مرات الاستخدام لكل مستخدم">
              <input
                type="number"
                min="1"
                value={discountPerUser}
                onChange={(event) => setDiscountPerUser(event.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="يبدأ">
                <input
                  type="datetime-local"
                  value={discountStartsAt}
                  onChange={(event) => setDiscountStartsAt(event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="ينتهي">
                <input
                  type="datetime-local"
                  value={discountEndsAt}
                  onChange={(event) => setDiscountEndsAt(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <button
              type="submit"
              className="w-full rounded-[18px] bg-gradient-to-l from-amber-500 to-orange-600 px-5 py-4 text-sm font-black"
            >
              إنشاء الكود
            </button>
          </form>
        </Modal>
      )}

      {message && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
          <div className="w-full max-w-[340px] rounded-[22px] border border-emerald-400/15 bg-[#171322]/95 px-4 py-3.5 text-center text-xs font-black text-emerald-300 shadow-2xl backdrop-blur-xl">
            {message}
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-400/50";

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/[0.07] bg-[#121019] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold text-amber-400">{subtitle}</p>
          <h2 className="mt-1 text-lg font-black">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
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
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0"
      />
      <section className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[30px] border border-white/10 bg-[#121019] p-4 shadow-2xl sm:rounded-[30px] sm:p-5">
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-[#121019] pb-3">
          <h2 className="text-lg font-black">{title}</h2>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-xs font-black">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5"
      />
    </label>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[8px] font-black text-gray-300">
      {text}
    </span>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-xs text-gray-500">
      {text}
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: [string, string][];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3"
        >
          <p className="text-[9px] text-gray-500">{label}</p>
          <p className="mt-1 break-words text-xs font-black">{value}</p>
        </div>
      ))}
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
    <div className="rounded-[18px] border border-red-400/20 bg-red-500/10 p-4">
      <p className="text-[10px] font-black text-red-300">{title}</p>
      <p className="mt-2 text-xs leading-6 text-red-100">{value}</p>
    </div>
  );
}