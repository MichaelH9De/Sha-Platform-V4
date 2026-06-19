import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role === "Client/External") notFound();
  const allocations = await prisma.resourceAllocation.findMany({ where: { project: projectScope(user) }, select: { id: true, weekStart: true, plannedHours: true, capacityHours: true, user: { select: { name: true } }, project: { select: { name: true } }, discipline: { select: { code: true } } }, orderBy: { weekStart: "asc" }, take: 250 });
  return <section className="stack"><PageHeader eyebrow="Internal capacity plan" title="Resources">Weekly planned and available hours for authorised projects.</PageHeader><div className="panel"><ul className="list">{allocations.map((item) => <li key={item.id}><strong>{item.user.name}: {item.plannedHours}/{item.capacityHours} hours</strong><br /><small>{item.project.name} · {item.discipline.code} · week of {item.weekStart.toLocaleDateString("en-GB")}</small></li>)}</ul></div></section>;
}
