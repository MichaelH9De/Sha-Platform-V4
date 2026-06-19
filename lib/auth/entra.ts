import { createHash, createHmac, createPublicKey, randomBytes, timingSafeEqual, verify } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "mep_session";
export const OIDC_STATE_COOKIE = "mep_oidc_state";
export const OIDC_NONCE_COOKIE = "mep_oidc_nonce";
export const OIDC_VERIFIER_COOKIE = "mep_oidc_verifier";
export const SESSION_MAX_AGE = 8 * 60 * 60;

type OidcMetadata = { authorization_endpoint: string; token_endpoint: string; jwks_uri: string; issuer: string };
type SessionIdentity = { sub: string; email: string; exp: number };
type IdTokenClaims = SessionIdentity & { aud: string; iss: string; nonce: string; preferred_username?: string };
type MicrosoftRsaJwk = { kid?: string; kty?: string; n?: string; e?: string; alg?: string; use?: string };

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function authSecret() {
  const value = required("AUTH_SECRET");
  if (Buffer.byteLength(value) < 32) throw new Error("AUTH_SECRET must contain at least 32 bytes");
  return value;
}

function b64url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function parsePart<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
}

export function randomUrlToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function pkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function getOidcMetadata(): Promise<OidcMetadata> {
  const issuer = required("AUTH_MICROSOFT_ENTRA_ID_ISSUER").replace(/\/$/, "");
  const response = await fetch(`${issuer}/.well-known/openid-configuration`, { next: { revalidate: 3600 } });
  if (!response.ok) throw new Error("Unable to load Entra OpenID configuration");
  return response.json() as Promise<OidcMetadata>;
}

export function createSessionToken(identity: Omit<SessionIdentity, "exp">) {
  const payload: SessionIdentity = { ...identity, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const unsigned = `${b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))}.${b64url(JSON.stringify(payload))}`;
  const signature = createHmac("sha256", authSecret()).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

export function verifySessionToken(token: string): SessionIdentity | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = createHmac("sha256", authSecret()).update(unsigned).digest();
  const supplied = Buffer.from(parts[2], "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  const payload = parsePart<SessionIdentity>(parts[1]);
  return payload.exp > Math.floor(Date.now() / 1000) && payload.email ? payload : null;
}

export async function getSessionIdentity() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function exchangeAndValidateCode(code: string, verifier: string, expectedNonce: string, redirectUri: string) {
  const metadata = await getOidcMetadata();
  const clientId = required("AUTH_MICROSOFT_ENTRA_ID_ID");
  const response = await fetch(metadata.token_endpoint, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: required("AUTH_MICROSOFT_ENTRA_ID_SECRET"), grant_type: "authorization_code", code, redirect_uri: redirectUri, code_verifier: verifier })
  });
  if (!response.ok) throw new Error("Entra token exchange failed");
  const tokens = await response.json() as { id_token?: string };
  if (!tokens.id_token) throw new Error("Entra response did not include an ID token");

  const [encodedHeader, encodedPayload, encodedSignature] = tokens.id_token.split(".");
  const header = parsePart<{ alg: string; kid: string }>(encodedHeader);
  const claims = parsePart<IdTokenClaims>(encodedPayload);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported ID token signature");
  const jwksResponse = await fetch(metadata.jwks_uri, { next: { revalidate: 3600 } });
  if (!jwksResponse.ok) throw new Error("Unable to load Entra signing keys");
  const { keys } = await jwksResponse.json() as { keys: MicrosoftRsaJwk[] };
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("ID token signing key was not found");
  if (jwk.kty !== "RSA" || !jwk.n || !jwk.e) throw new Error("ID token signing key is not a valid RSA JWK");
  const cleanJwk = { kty: "RSA", n: jwk.n, e: jwk.e, alg: jwk.alg, use: jwk.use };
  const validSignature = verify("RSA-SHA256", Buffer.from(`${encodedHeader}.${encodedPayload}`), createPublicKey({ key: cleanJwk, format: "jwk" }), Buffer.from(encodedSignature, "base64url"));
  const now = Math.floor(Date.now() / 1000);
  if (!validSignature || claims.aud !== clientId || claims.iss !== metadata.issuer || claims.exp <= now || claims.nonce !== expectedNonce) throw new Error("ID token validation failed");
  const email = (claims.email || claims.preferred_username)?.toLowerCase();
  if (!email) throw new Error("The Entra identity has no email address");
  return { sub: claims.sub, email };
}
