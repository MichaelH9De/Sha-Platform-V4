import { NextRequest, NextResponse } from "next/server";
import { buildClientFacingSnapshot } from "@/lib/reporting/field-filter";
import { requireApiUser } from "@/lib/auth/session";
import { assertCan } from "@/lib/permissions/policy";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiUser();
    assertCan(user.role, "report:generate");
    if (Number(request.headers.get("content-length") ?? 0) > 100_000) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const payload = await request.json();
    return NextResponse.json({ snapshot: buildClientFacingSnapshot(payload) });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Invalid report payload", details: error.flatten() }, { status: 400 });
    if (error instanceof Error && error.message === "UNAUTHENTICATED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof Error && error.message.includes("cannot perform")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Unable to generate report snapshot" }, { status: 500 });
  }
}
