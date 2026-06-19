import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role !== "Admin" && user.role !== "Director") notFound();
  const events = await prisma.auditEvent.findMany({ take: 100, orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } });
  return <section className="stack"><PageHeader eyebrow="Restricted governance" title="Audit events">The latest 100 material platform changes, newest first.</PageHeader><div className="panel"><ul className="list">{events.map((event) => <li key={event.id}><strong>{event.action} · {event.entityType}</strong><br /><small>{event.actor?.name ?? "System"} · {event.createdAt.toLocaleString("en-GB")} · {event.sourcePath ?? "Unspecified source"}</small></li>)}</ul></div></section>;
}
