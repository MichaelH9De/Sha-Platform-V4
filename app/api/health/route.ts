import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "MEP Enterprise Platform",
    mode: isDemoMode() ? "demo" : "enterprise",
    timestamp: new Date().toISOString()
  });
}
