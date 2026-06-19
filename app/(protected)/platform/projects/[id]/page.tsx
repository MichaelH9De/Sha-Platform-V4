import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { prisma } from "@/lib/db/client";
import { requireCurrentUser } from "@/lib/auth/session";
import { assertProjectAccess } from "@/lib/permissions/policy";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  assertProjectAccess(user.role, user.projectIds, id);
  const external = user.role === "Client/External";
  const [project, deliverables, risks] = await Promise.all([
    prisma.project.findUnique({ where: { id }, select: { id: true, name: true, sector: true, health: true, status: true, client: { select: { name: true } }, _count: { select: { stages: true } } } }),
    prisma.deliverable.findMany({ where: { projectId: id, ...(external ? { issueStatus: { not: "Not issued" } } : {}) }, select: { id: true, title: true, status: true, qaStatus: true, dueDate: true, revision: true, issueStatus: true }, orderBy: { dueDate: "asc" } }),
    external ? Promise.resolve([]) : prisma.risk.findMany({ where: { projectId: id }, select: { id: true, severity: true, description: true, status: true, mitigation: true }, orderBy: { severity: "desc" } })
  ]);
  if (!project) notFound();

  return (
    <section className="stack">
      <PageHeader eyebrow="Protected project workspace" title={project.name}>{project.client.name} · {project.sector}. Access is checked against live project membership.</PageHeader>
      <div className="grid three">
        <MetricCard label="Health" value={project.health} />
        <MetricCard label="Status" value={project.status} />
        <MetricCard label="Stages" value={String(project._count.stages)} />
      </div>
      <div className="panel">
        <h2>Deliverables</h2>
        <ul className="list">{deliverables.map((item) => <li key={item.id}><strong>{item.title}</strong><br /><small>{item.status} · QA {item.qaStatus} · {item.revision} · {item.issueStatus} · due {item.dueDate.toLocaleDateString("en-GB")}</small></li>)}</ul>
      </div>
      {!external && <div className="panel">
        <h2>Risk register</h2>
        <ul className="list">{risks.map((risk) => <li key={risk.id}><strong>{risk.severity}: {risk.description}</strong><br /><small>{risk.status} · {risk.mitigation}</small></li>)}</ul>
      </div>}
    </section>
  );
}
