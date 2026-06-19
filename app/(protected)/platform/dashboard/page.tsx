import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { prisma } from "@/lib/db/client";
import { requireCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireCurrentUser();
  const projectWhere = ["Admin", "Director"].includes(user.role) ? {} : { members: { some: { userId: user.id } } };
  const external = user.role === "Client/External";
  const [projects, redProjects, overdueDeliverables, openRisks] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.project.count({ where: { ...projectWhere, health: "RED" } }),
    prisma.deliverable.count({ where: { project: projectWhere, ...(external ? { issueStatus: { not: "Not issued" } } : {}), dueDate: { lt: new Date() }, status: { notIn: ["COMPLETE", "CLOSED", "CANCELLED"] } } }),
    external ? Promise.resolve(0) : prisma.risk.count({ where: { project: projectWhere, status: { in: ["OPEN", "IN_PROGRESS", "BLOCKED"] } } })
  ]);
  return (
    <section className="stack">
      <PageHeader eyebrow="Live portfolio" title="Enterprise Control Dashboard">Project health, overdue deliverables and open risk exposure from records you are authorised to access.</PageHeader>
      <div className="grid cols-4">
        <MetricCard label="Accessible projects" value={String(projects)} />
        <MetricCard label="Red projects" value={String(redProjects)} />
        <MetricCard label="Overdue deliverables" value={String(overdueDeliverables)} />
        {!external && <MetricCard label="Open risks" value={String(openRisks)} />}
      </div>
      <div className="panel">
        <h2>Access context</h2>
        <p>Signed in as {user.name} ({user.role}). Portfolio roles see all projects; all other users see assigned projects only.</p>
      </div>
    </section>
  );
}
