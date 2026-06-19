import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role === "Client/External") notFound();
  const risks = await prisma.risk.findMany({ where: { project: projectScope(user) }, select: { id: true, description: true, severity: true, likelihood: true, mitigation: true, status: true, project: { select: { name: true } } }, orderBy: [{ severity: "desc" }, { updatedAt: "desc" }], take: 250 });
  return <section className="stack"><PageHeader eyebrow="Internal control register" title="Risks">Design, programme and commercial risks for projects you are assigned to.</PageHeader><div className="panel"><ul className="list">{risks.map((risk) => <li key={risk.id}><strong>{risk.severity}/{risk.likelihood}: {risk.description}</strong><br /><small>{risk.project.name} · {risk.status} · {risk.mitigation}</small></li>)}</ul></div></section>;
}
