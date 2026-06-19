import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  const reports = await prisma.report.findMany({ where: { project: projectScope(user), ...(user.role === "Client/External" ? { audience: "CLIENT", status: { in: ["COMPLETE", "CLOSED"] } } : {}) }, select: { id: true, audience: true, status: true, createdAt: true, snapshotJson: true, project: { select: { name: true } }, template: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return <section className="stack"><PageHeader eyebrow="Audience-controlled outputs" title="Reports">External accounts receive only completed client reports built from the explicit allowlist schema.</PageHeader><div className="panel"><ul className="list">{reports.map((report) => <li key={report.id}><strong>{report.template.name}: {report.project.name}</strong><br /><small>{report.audience} · {report.status} · {report.createdAt.toLocaleString("en-GB")}</small>{user.role === "Client/External" && report.snapshotJson ? <pre>{report.snapshotJson}</pre> : null}</li>)}</ul></div></section>;
}
