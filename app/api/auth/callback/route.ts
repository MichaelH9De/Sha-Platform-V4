import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, exchangeAndValidateCode, OIDC_NONCE_COOKIE, OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth/entra";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(OIDC_STATE_COOKIE)?.value;
  const nonce = request.cookies.get(OIDC_NONCE_COOKIE)?.value;
  const verifier = request.cookies.get(OIDC_VERIFIER_COOKIE)?.value;
  if (!code || !state || !expectedState || !nonce || !verifier || state !== expectedState) return NextResponse.redirect(new URL("/sign-in?error=invalid_callback", request.url));
  try {
    const identity = await exchangeAndValidateCode(code, verifier, nonce, new URL("/api/auth/callback", request.url).toString());
    const user = await prisma.user.findFirst({ where: { email: identity.email, status: "ACTIVE" }, select: { id: true } });
    if (!user) return NextResponse.redirect(new URL("/sign-in?error=access_denied", request.url));
    const response = NextResponse.redirect(new URL("/platform/dashboard", request.url));
    response.cookies.set(SESSION_COOKIE, createSessionToken(identity), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE });
    for (const name of [OIDC_STATE_COOKIE, OIDC_NONCE_COOKIE, OIDC_VERIFIER_COOKIE]) response.cookies.delete(name);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/sign-in?error=authentication_failed", request.url));
  }
}
