import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { requireCurrentUser } from "@/lib/auth/session";
import { canPerform } from "@/lib/permissions/policy";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireCurrentUser();
  const projects = await prisma.project.findMany({
    where: ["Admin", "Director"].includes(user.role) ? {} : { members: { some: { userId: user.id } } },
    select: { id: true, name: true, sector: true, status: true, health: true, client: { select: { name: true } }, _count: { select: { deliverables: true, risks: true } } },
    orderBy: { updatedAt: "desc" }
  });
  return (
    <section className="stack">
      <PageHeader eyebrow="Authorised portfolio" title="Projects">Create, review and control project records, appointments, stages, deliverables and risks.</PageHeader>
      {canPerform(user.role, "project:create") && <div><Link className="btn primary" href="/platform/projects/new">Create project</Link></div>}
      <div className="grid three">
        <MetricCard label="Projects" value={String(projects.length)} />
        <MetricCard label="Red" value={String(projects.filter((project) => project.health === "RED").length)} />
        <MetricCard label="Live" value={String(projects.filter((project) => project.status === "LIVE").length)} />
      </div>
      <div className="panel">
        <h2>Project register</h2>
        <ul className="list">{projects.map((project) => <li key={project.id}><Link href={`/platform/projects/${project.id}`}><strong>{project.name}</strong></Link><br /><small>{project.client.name} · {project.sector} · {project.status} · {project.health}{user.role !== "Client/External" ? ` · ${project._count.deliverables} deliverables · ${project._count.risks} risks` : ""}</small></li>)}</ul>
      </div>
    </section>
  );
}
