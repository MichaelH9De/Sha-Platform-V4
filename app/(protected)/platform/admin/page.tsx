import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role !== "Admin") notFound();
  const [users, roles, disciplines] = await Promise.all([prisma.user.count(), prisma.role.count(), prisma.discipline.count({ where: { active: true } })]);
  return <section className="stack"><PageHeader eyebrow="Restricted administration" title="Platform configuration">Identity records, roles, templates and disciplines. Administrative mutations must follow the audited service contract.</PageHeader><div className="grid three"><MetricCard label="Users" value={String(users)} /><MetricCard label="Roles" value={String(roles)} /><MetricCard label="Active disciplines" value={String(disciplines)} /></div></section>;
}
