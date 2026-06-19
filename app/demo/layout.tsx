import { redirect } from "next/navigation";
import { DemoAppShell } from "@/components/DemoAppShell";
import { isDemoMode } from "@/lib/demo-mode";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  if (!isDemoMode()) redirect("/platform/dashboard");
  return <DemoAppShell>{children}</DemoAppShell>;
}
