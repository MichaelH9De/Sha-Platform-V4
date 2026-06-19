import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";
export const dynamic = "force-dynamic";
export default async function Page() { const user = await requireCurrentUser(); if (user.role === "Client/External") notFound(); const items = await prisma.bIMRecord.findMany({ where: { project: projectScope(user) }, select: { id: true, modelReference: true, status: true, lastCheckedAt: true, cdeLink: true, project: { select: { name: true } }, discipline: { select: { code: true } } }, orderBy: { updatedAt: "desc" }, take: 250 }); return <section className="stack"><PageHeader eyebrow="Internal digital governance" title="BIM / Revit records">Model references, discipline status and controlled CDE links.</PageHeader><div className="panel"><ul className="list">{items.map((item) => <li key={item.id}><strong>{item.modelReference}</strong><br /><small>{item.project.name} · {item.discipline.code} · {item.status} · checked {item.lastCheckedAt?.toLocaleDateString("en-GB") ?? "not yet"}{item.cdeLink ? ` · ${item.cdeLink}` : ""}</small></li>)}</ul></div></section>; }
