import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  const items = await prisma.deliverable.findMany({ where: { project: projectScope(user), ...(user.role === "Client/External" ? { issueStatus: { not: "Not issued" } } : {}) }, select: { id: true, title: true, status: true, qaStatus: true, dueDate: true, revision: true, issueStatus: true, project: { select: { name: true } } }, orderBy: { dueDate: "asc" }, take: 250 });
  return <section className="stack"><PageHeader eyebrow="Authorised delivery register" title="Deliverables">Issued client records or the internal delivery queue, according to your role.</PageHeader><div className="panel"><ul className="list">{items.map((item) => <li key={item.id}><strong>{item.title}</strong><br /><small>{item.project.name} · {item.status} · QA {item.qaStatus} · {item.revision} · {item.issueStatus} · {item.dueDate.toLocaleDateString("en-GB")}</small></li>)}</ul></div></section>;
}
