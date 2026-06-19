import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const webhookSchema = z.object({
  eventId: z.string().min(1).max(200),
  eventType: z.string().min(1).max(200),
  occurredAt: z.string().datetime(),
  data: z.record(z.unknown())
}).strict();

export async function POST(request: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) return NextResponse.json({ error: "Webhook integration is not configured" }, { status: 503 });
  if (Number(request.headers.get("content-length") ?? 0) > 250_000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });

  const body = await request.text();
  const supplied = request.headers.get("x-webhook-signature")?.replace(/^sha256=/, "") ?? "";
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const valid = supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  let json: unknown;
  try { json = JSON.parse(body); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = webhookSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  // Events are authenticated and validated here; connect an idempotent event processor per integration.
  return NextResponse.json({ accepted: true, eventId: parsed.data.eventId }, { status: 202 });
}
