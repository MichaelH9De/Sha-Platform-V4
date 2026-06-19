import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); if (user.role === "Client/External") notFound(); const clients = await prisma.client.findMany({ where: { projects: { some: projectScope(user) } }, select: { id: true, name: true, sector: true, status: true, contactOwner: { select: { name: true } }, _count: { select: { projects: true } } }, orderBy: { name: "asc" } }); return <section className="stack"><PageHeader eyebrow="Internal portfolio" title="Clients">Client organisations attached to projects you can access.</PageHeader><div className="panel"><ul className="list">{clients.map((client) => <li key={client.id}><strong>{client.name}</strong><br /><small>{client.sector} · {client.status} · {client._count.projects} projects · owner {client.contactOwner.name}</small></li>)}</ul></div></section>; }
