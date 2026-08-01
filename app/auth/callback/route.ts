import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/?auth_error=missing_code", requestUrl.origin)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("تعذر إكمال تسجيل Google:", error);

    return NextResponse.redirect(
      new URL("/?auth_error=oauth_callback", requestUrl.origin)
    );
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(
      new URL(next, `${forwardedProto}://${forwardedHost}`)
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}