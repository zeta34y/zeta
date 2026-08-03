import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type IncomingItem = {
  id?: string | number;
  quantity?: number;
};

type ParsedItem = {
  cartId: string;
  prefix: "featured" | "shared" | "private" | "package";
  sourceId: string;
  quantity: number;
};

type OrderLine = {
  sourceId: string;
  sourceKind: "product" | "package";
  displayKind: "featured" | "shared" | "private" | "package";
  deliveryKind: "account" | "steam_code";
  name: string;
  platform: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
};

function moneyNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function parseCartItem(item: IncomingItem): ParsedItem | null {
  const cartId = String(item.id ?? "").trim();
  const match = cartId.match(/^(featured|shared|private|package)-(.+)$/);

  if (!match) return null;

  const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));

  return {
    cartId,
    prefix: match[1] as ParsedItem["prefix"],
    sourceId: match[2],
    quantity,
  };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error(
      "أضف NEXT_PUBLIC_SUPABASE_URL وSUPABASE_SECRET_KEY داخل إعدادات الخادم."
    );
  }

  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function bearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
}

export async function POST(request: NextRequest) {
  try {
    const token = bearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "سجّل الدخول أولًا لإتمام الطلب." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      items?: IncomingItem[];
      couponCode?: string;
      paymentMethod?: string;
      checkoutToken?: string;
    };

    const parsedItems = (body.items ?? [])
      .map(parseCartItem)
      .filter((item): item is ParsedItem => item !== null);

    if (!parsedItems.length) {
      return NextResponse.json(
        { error: "السلة فارغة أو تحتوي عناصر غير صالحة." },
        { status: 400 }
      );
    }

    const checkoutToken = String(body.checkoutToken ?? "").trim();

    if (!checkoutToken || checkoutToken.length > 120) {
      return NextResponse.json(
        { error: "تعذر إنشاء مرجع آمن للطلب. حدّث الصفحة وحاول مرة أخرى." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى." },
        { status: 401 }
      );
    }

    const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, total, status, payment_status")
      .eq("user_id", user.id)
      .eq("checkout_token", checkoutToken)
      .maybeSingle();

    if (existingOrderError) throw existingOrderError;

    if (existingOrder) {
      return NextResponse.json({
        orderId: existingOrder.id,
        orderNumber: existingOrder.order_number,
        total: moneyNumber(existingOrder.total),
        totalHalalas: Math.round(moneyNumber(existingOrder.total) * 100),
      });
    }

    const productIds = Array.from(
      new Set(
        parsedItems
          .filter((item) => item.prefix !== "package")
          .map((item) => item.sourceId)
      )
    );
    const packageIds = Array.from(
      new Set(
        parsedItems
          .filter((item) => item.prefix === "package")
          .map((item) => item.sourceId)
      )
    );

    const [productsResult, packagesResult, profileResult] = await Promise.all([
      productIds.length
        ? supabaseAdmin
            .from("products")
            .select(
              "id, name, platform, price, cover_url, display_kind, is_active"
            )
            .in("id", productIds)
        : Promise.resolve({ data: [], error: null }),
      packageIds.length
        ? supabaseAdmin
            .from("packages")
            .select("id, name, description, price, image_url, is_active")
            .in("id", packageIds)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin
        .from("profiles")
        .select("display_name, email, phone")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (productsResult.error) throw productsResult.error;
    if (packagesResult.error) throw packagesResult.error;
    if (profileResult.error) throw profileResult.error;

    const products = new Map(
      (productsResult.data ?? []).map((product) => [String(product.id), product])
    );
    const packages = new Map(
      (packagesResult.data ?? []).map((pkg) => [String(pkg.id), pkg])
    );

    const lines: OrderLine[] = parsedItems.map((item) => {
      if (item.prefix === "package") {
        const pkg = packages.get(item.sourceId);

        if (!pkg || !pkg.is_active) {
          throw new Error("أحد البكجات لم يعد متاحًا للشراء.");
        }

        return {
          sourceId: String(pkg.id),
          sourceKind: "package",
          displayKind: "package",
          deliveryKind: "account",
          name: String(pkg.name),
          platform: String(pkg.description || "بكج ألعاب PC"),
          imageUrl: pkg.image_url ?? null,
          unitPrice: moneyNumber(pkg.price),
          quantity: item.quantity,
        };
      }

      const product = products.get(item.sourceId);

      if (!product || !product.is_active) {
        throw new Error("إحدى الألعاب لم تعد متاحة للشراء.");
      }

      const displayKind =
        product.display_kind === "shared" || product.display_kind === "private"
          ? product.display_kind
          : "featured";

      return {
        sourceId: String(product.id),
        sourceKind: "product",
        displayKind,
        deliveryKind: displayKind === "private" ? "steam_code" : "account",
        name: String(product.name),
        platform: String(product.platform || "PC"),
        imageUrl: product.cover_url ?? null,
        unitPrice: moneyNumber(product.price),
        quantity: item.quantity,
      };
    });

    const subtotal = roundMoney(
      lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0)
    );

    let discountAmount = 0;
    let discountCode: string | null = null;
    let discountPercent: number | null = null;
    const requestedCoupon = String(body.couponCode ?? "").trim().toUpperCase();

    if (requestedCoupon) {
      const { data: code, error: codeError } = await supabaseAdmin
        .from("discount_codes")
        .select(
          "id, code, discount_percent, discount_value, applies_to_all, target_user_id, is_active, starts_at, ends_at, minimum_order, usage_limit, used_count"
        )
        .ilike("code", requestedCoupon)
        .maybeSingle();

      if (codeError) throw codeError;

      if (code?.is_active) {
        const now = Date.now();
        const startsAt = code.starts_at ? new Date(code.starts_at).getTime() : null;
        const endsAt = code.ends_at ? new Date(code.ends_at).getTime() : null;
        const targetMatches = !code.target_user_id || code.target_user_id === user.id;
        const withinDates =
          (!startsAt || startsAt <= now) && (!endsAt || endsAt > now);
        const belowUsageLimit =
          !code.usage_limit || Number(code.used_count || 0) < Number(code.usage_limit);
        const minimumReached = subtotal >= moneyNumber(code.minimum_order);

        if (targetMatches && withinDates && belowUsageLimit && minimumReached) {
          let eligibleSubtotal = subtotal;

          if (!code.applies_to_all) {
            const { data: assignments, error: assignmentsError } = await supabaseAdmin
              .from("discount_code_products")
              .select("product_id")
              .eq("discount_code_id", code.id);

            if (assignmentsError) throw assignmentsError;

            const eligibleIds = new Set(
              (assignments ?? []).map((assignment) => String(assignment.product_id))
            );

            eligibleSubtotal = lines.reduce((total, line) => {
              return line.sourceKind === "product" && eligibleIds.has(line.sourceId)
                ? total + line.unitPrice * line.quantity
                : total;
            }, 0);
          }

          const percent = Math.min(
            100,
            Math.max(
              0,
              moneyNumber(code.discount_percent ?? code.discount_value)
            )
          );

          if (eligibleSubtotal > 0 && percent > 0) {
            discountAmount = roundMoney((eligibleSubtotal * percent) / 100);
            discountCode = String(code.code);
            discountPercent = percent;
          }
        }
      }
    }

    const total = roundMoney(Math.max(0, subtotal - discountAmount));

    if (total <= 0) {
      return NextResponse.json(
        { error: "إجمالي الطلب غير صالح للدفع." },
        { status: 400 }
      );
    }

    const orderNumber = `ZT-${Date.now().toString().slice(-8)}-${Math.floor(
      100 + Math.random() * 900
    )}`;
    const profile = profileResult.data;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: "pending",
        payment_status: "pending",
        payment_method: String(body.paymentMethod || "creditcard"),
        subtotal,
        discount_amount: discountAmount,
        discount_code: discountCode,
        discount_percent: discountPercent,
        total,
        customer_name:
          profile?.display_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "عميل ZETA",
        customer_email: profile?.email || user.email || null,
        customer_phone:
          profile?.phone || user.user_metadata?.contact_phone || user.phone || null,
        checkout_token: checkoutToken,
      })
      .select("id, order_number, total")
      .single();

    if (orderError) throw orderError;

    const orderItemRows = lines.map((line) => ({
      order_id: order.id,
      item_name: line.name,
      item_type: line.sourceKind,
      image_url: line.imageUrl,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      total_price: roundMoney(line.unitPrice * line.quantity),
      source_id: line.sourceId,
      source_kind: line.sourceKind,
      product_display_kind: line.displayKind,
      delivery_kind: line.deliveryKind,
      platform: line.platform,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemRows)
      .select("id, quantity, delivery_kind");

    if (itemsError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    const deliveryRows = (insertedItems ?? []).flatMap((item) => {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      return Array.from({ length: quantity }, (_, index) => ({
        order_id: order.id,
        order_item_id: item.id,
        user_id: user.id,
        delivery_type:
          item.delivery_kind === "steam_code" ? "steam_code" : "account",
        delivery_index: index + 1,
      }));
    });

    const { error: deliveriesError } = await supabaseAdmin
      .from("order_deliveries")
      .insert(deliveryRows);

    if (deliveriesError) {
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      throw deliveriesError;
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total: moneyNumber(order.total),
      totalHalalas: Math.round(moneyNumber(order.total) * 100),
    });
  } catch (error) {
    console.error("تعذر إنشاء طلب ZETA:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر إنشاء الطلب. حاول مرة أخرى.",
      },
      { status: 500 }
    );
  }
}