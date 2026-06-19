import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); if (user.role === "Client/External") notFound(); const items = await prisma.action.findMany({ where: { project: projectScope(user) }, select: { id: true, description: true, dueDate: true, priority: true, status: true, owner: { select: { name: true } }, project: { select: { name: true } } }, orderBy: { dueDate: "asc" }, take: 250 }); return <section className="stack"><PageHeader eyebrow="Internal delivery control" title="Actions">Owned actions and due dates for authorised projects.</PageHeader><div className="panel"><ul className="list">{items.map((item) => <li key={item.id}><strong>{item.priority}: {item.description}</strong><br /><small>{item.project.name} · {item.owner.name} · {item.status} · due {item.dueDate.toLocaleDateString("en-GB")}</small></li>)}</ul></div></section>; }
