import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type MoyasarPayment = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown> | null;
  source?: {
    type?: string;
    company?: string;
  } | null;
  paid_at?: string | null;
};

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret) {
    throw new Error("إعدادات Supabase السرية غير مكتملة على الخادم.");
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
      return NextResponse.json({ error: "سجّل الدخول أولًا." }, { status: 401 });
    }

    const body = (await request.json()) as {
      paymentId?: string;
      orderId?: string;
    };
    const paymentId = String(body.paymentId ?? "").trim();
    const orderId = String(body.orderId ?? "").trim();

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: "بيانات عملية الدفع أو الطلب ناقصة." },
        { status: 400 }
      );
    }

    const moyasarSecret = process.env.MOYASAR_SECRET_KEY?.trim();

    if (!moyasarSecret) {
      throw new Error("أضف MOYASAR_SECRET_KEY داخل إعدادات Vercel.");
    }

    const supabaseAdmin = getAdminClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "انتهت جلسة تسجيل الدخول." },
        { status: 401 }
      );
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, user_id, total, payment_status, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (orderError) throw orderError;

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود." }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
      });
    }

    const authorization = Buffer.from(`${moyasarSecret}:`).toString("base64");
    const paymentResponse = await fetch(
      `https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${authorization}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.text();
      console.error("Moyasar verification failed:", paymentError);
      return NextResponse.json(
        { error: "تعذر التحقق من العملية من بوابة الدفع." },
        { status: 502 }
      );
    }

    const payment = (await paymentResponse.json()) as MoyasarPayment;
    const expectedAmount = Math.round(Number(order.total || 0) * 100);
    const metadataOrderId = String(payment.metadata?.order_id ?? "");

    if (payment.status !== "paid") {
      return NextResponse.json(
        { error: "عملية الدفع غير مكتملة حتى الآن." },
        { status: 400 }
      );
    }

    if (payment.amount !== expectedAmount || payment.currency !== "SAR") {
      return NextResponse.json(
        { error: "مبلغ العملية أو العملة لا يطابقان الطلب." },
        { status: 400 }
      );
    }

    if (metadataOrderId && metadataOrderId !== order.id) {
      return NextResponse.json(
        { error: "مرجع عملية الدفع لا يطابق الطلب." },
        { status: 400 }
      );
    }

    const paidAt = payment.paid_at || new Date().toISOString();
    const paymentMethod =
      payment.source?.company || payment.source?.type || "moyasar";

    const { data: existingPayment, error: existingPaymentError } =
      await supabaseAdmin
        .from("payments")
        .select("id")
        .eq("transaction_id", payment.id)
        .maybeSingle();

    if (existingPaymentError) throw existingPaymentError;

    const paymentPayload = {
      order_id: order.id,
      provider: "moyasar",
      transaction_id: payment.id,
      method: paymentMethod,
      status: "paid",
      amount: payment.amount / 100,
      currency: payment.currency,
      failure_reason: null,
      paid_at: paidAt,
    };

    if (existingPayment) {
      const { error } = await supabaseAdmin
        .from("payments")
        .update(paymentPayload)
        .eq("id", existingPayment.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("payments").insert(paymentPayload);
      if (error) throw error;
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "processing",
        payment_status: "paid",
        payment_method: paymentMethod,
        payment_provider_id: payment.id,
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) throw updateOrderError;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("تعذر اعتماد عملية الدفع:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "تعذر اعتماد عملية الدفع.",
      },
      { status: 500 }
    );
  }
}