import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); if (user.role === "Client/External") notFound(); const items = await prisma.decision.findMany({ where: { project: projectScope(user) }, select: { id: true, decision: true, impact: true, date: true, status: true, owner: { select: { name: true } }, project: { select: { name: true } } }, orderBy: { date: "desc" }, take: 250 }); return <section className="stack"><PageHeader eyebrow="Internal decision trail" title="Decisions">Recorded decisions, ownership and impact for authorised projects.</PageHeader><div className="panel"><ul className="list">{items.map((item) => <li key={item.id}><strong>{item.decision}</strong><br /><small>{item.project.name} · {item.owner.name} · {item.status} · {item.date.toLocaleDateString("en-GB")} · {item.impact}</small></li>)}</ul></div></section>; }
