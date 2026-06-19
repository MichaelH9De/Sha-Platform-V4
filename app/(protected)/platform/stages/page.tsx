import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); const stages = await prisma.stage.findMany({ where: { project: projectScope(user) }, select: { id: true, name: true, order: true, actualStatus: true, plannedStart: true, plannedEnd: true, project: { select: { name: true } } }, orderBy: [{ projectId: "asc" }, { order: "asc" }], take: 250 }); return <section className="stack"><PageHeader eyebrow="Staged delivery" title="RIBA / BSRIA stage control">Programme status for authorised projects.</PageHeader><div className="panel"><ul className="list">{stages.map((stage) => <li key={stage.id}><strong>{stage.project.name}: {stage.name}</strong><br /><small>{stage.actualStatus} · {stage.plannedStart?.toLocaleDateString("en-GB") ?? "TBC"} to {stage.plannedEnd?.toLocaleDateString("en-GB") ?? "TBC"}</small></li>)}</ul></div></section>; }
