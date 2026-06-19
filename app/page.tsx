import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";

export default function HomePage() {
  redirect(isDemoMode() ? "/demo/dashboard" : "/platform/dashboard");
}
