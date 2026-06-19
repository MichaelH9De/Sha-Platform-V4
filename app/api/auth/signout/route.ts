import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/entra";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).origin !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const response = NextResponse.redirect(new URL("/sign-in", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
