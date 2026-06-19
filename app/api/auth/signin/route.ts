import { NextRequest, NextResponse } from "next/server";
import { getOidcMetadata, OIDC_NONCE_COOKIE, OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, pkceChallenge, randomUrlToken } from "@/lib/auth/entra";
import { isDemoMode } from "@/lib/demo-mode";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (isDemoMode()) return NextResponse.redirect(new URL("/demo/dashboard", request.url));
  const metadata = await getOidcMetadata();
  const state = randomUrlToken();
  const nonce = randomUrlToken();
  const verifier = randomUrlToken(48);
  const redirectUri = new URL("/api/auth/callback", request.url).toString();
  const target = new URL(metadata.authorization_endpoint);
  target.search = new URLSearchParams({ client_id: process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? "", response_type: "code", redirect_uri: redirectUri, response_mode: "query", scope: "openid profile email", state, nonce, code_challenge: pkceChallenge(verifier), code_challenge_method: "S256" }).toString();
  const response = NextResponse.redirect(target);
  const cookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
  response.cookies.set(OIDC_STATE_COOKIE, state, cookie);
  response.cookies.set(OIDC_NONCE_COOKIE, nonce, cookie);
  response.cookies.set(OIDC_VERIFIER_COOKIE, verifier, cookie);
  return response;
}
