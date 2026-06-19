import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role === "Client/External") notFound();
  const reviews = await prisma.qAReview.findMany({ where: { deliverable: { project: projectScope(user) } }, select: { id: true, status: true, approvalState: true, requiredActions: true, reviewer: { select: { name: true } }, deliverable: { select: { title: true, project: { select: { name: true } } } } }, orderBy: { updatedAt: "desc" }, take: 250 });
  return <section className="stack"><PageHeader eyebrow="Internal technical governance" title="QA reviews">Review status and required actions without exposing internal comments outside the QA workflow.</PageHeader><div className="panel"><ul className="list">{reviews.map((review) => <li key={review.id}><strong>{review.deliverable.title}: {review.status}</strong><br /><small>{review.deliverable.project.name} · {review.reviewer.name} · {review.approvalState} · {review.requiredActions ?? "No outstanding action"}</small></li>)}</ul></div></section>;
}
