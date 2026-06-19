import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth/entra";
import { isDemoMode } from "@/lib/demo-mode";

export default async function SignInPage() {
  if (isDemoMode()) redirect("/demo/dashboard");
  if (await getSessionIdentity()) redirect("/platform/dashboard");
  return (
    <main className="login-shell">
      <section className="card login-card">
        <div className="eyebrow">Secure access</div>
        <h1>MEP Enterprise Platform</h1>
        <p className="kicker">Sign in with your approved Microsoft work account. Access is granted only to active users configured by an administrator.</p>
        <Link className="btn primary" href="/api/auth/signin">Sign in with Microsoft</Link>
      </section>
    </main>
  );
}
