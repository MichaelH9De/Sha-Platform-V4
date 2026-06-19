import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { projectScope } from "@/lib/permissions/project-scope";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireCurrentUser();
  if (user.role === "Client/External" || user.role === "Engineer") notFound();
  const forecasts = await prisma.feeForecast.findMany({ where: { project: projectScope(user) }, select: { id: true, actualHours: true, forecastHours: true, varianceValue: true, status: true, project: { select: { name: true } } }, orderBy: { updatedAt: "desc" }, take: 250 });
  return <section className="stack"><PageHeader eyebrow="Restricted commercial control" title="Fee forecasts">Internal actual, forecast and variance values. This route is unavailable to external users and engineers.</PageHeader><div className="panel"><ul className="list">{forecasts.map((item) => <li key={item.id}><strong>{item.project.name}: £{item.varianceValue.toLocaleString("en-GB")}</strong><br /><small>{item.actualHours} actual hours · {item.forecastHours} forecast hours · {item.status}</small></li>)}</ul></div></section>;
}
