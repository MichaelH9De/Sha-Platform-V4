import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); if (user.role === "Client/External") notFound(); const items = await prisma.appointment.findMany({ where: { project: projectScope(user) }, select: { id: true, scopeSummary: true, feeBasis: true, status: true, startDate: true, endDate: true, project: { select: { name: true } } }, orderBy: { startDate: "desc" }, take: 250 }); return <section className="stack"><PageHeader eyebrow="Internal scope control" title="Appointments">Appointment periods, scope and fee basis for authorised projects.</PageHeader><div className="panel"><ul className="list">{items.map((item) => <li key={item.id}><strong>{item.project.name}: {item.scopeSummary}</strong><br /><small>{item.feeBasis} · {item.status} · {item.startDate.toLocaleDateString("en-GB")} to {item.endDate?.toLocaleDateString("en-GB") ?? "open"}</small></li>)}</ul></div></section>; }
