import { AppShell } from "@/components/AppShell";
import { requireCurrentUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo-mode";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  if (isDemoMode()) redirect("/demo/dashboard");
  const user = await requireCurrentUser();
  return <AppShell role={user.role}>{children}</AppShell>;
}
