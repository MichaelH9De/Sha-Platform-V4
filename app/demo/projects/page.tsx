import Link from "next/link";
import { Activity, ArrowUpRight, BriefcaseBusiness, FolderKanban, Radio } from "lucide-react";
import { deliverables, fees, money, projects, risks } from "@/lib/demo-data";

export default function Page() {
  const exposure = fees.filter((fee) => fee.variance < 0).reduce((sum, fee) => sum + Math.abs(fee.variance), 0);
  const metrics = [
    { label: "Active projects", value: projects.length, note: "Live portfolio", tone: "cyan", icon: FolderKanban },
    { label: "At risk", value: projects.filter((project) => project.health !== "GREEN").length, note: "Amber or red", tone: "magenta", icon: Activity },
    { label: "Deliverables", value: deliverables.length, note: "Across all commissions", tone: "cyan", icon: ArrowUpRight },
    { label: "Fee exposure", value: money(exposure), note: "Forecast overspend", tone: "amber", icon: BriefcaseBusiness }
  ] as const;

  return <section className="command-centre">
    <header className="command-header"><div className="command-title-group"><div className="command-kicker"><Radio size={14} /> Portfolio control</div><h1>Projects</h1><p>Live commission health, delivery stage and commercial position.</p></div><span className="demo-status"><i /> Demo data</span></header>
    <div className="command-metrics">{metrics.map(({ label, value, note, tone, icon: Icon }) => <article className={`command-metric tone-${tone}`} key={label}><div className="metric-top"><span>{label}</span><Icon size={18} /></div><strong>{value}</strong><div className="metric-foot"><span>{note}</span><ArrowUpRight size={14} /></div></article>)}</div>
    <article className="command-panel"><div className="panel-heading"><div><span className="panel-label">Portfolio register</span><h2>Active commissions</h2></div><span className="panel-meta">{projects.length} projects</span></div><div className="project-register" role="table" aria-label="Projects"><div className="project-row project-row-head" role="row"><span>Project</span><span>Stage</span><span>Health</span><span>Commercial</span></div>{projects.map((project) => { const fee = fees.find((item) => item.project === project.name); return <div className="project-row" role="row" key={project.id}><div><Link href={`/demo/projects/${project.id}`}><strong>{project.name}</strong></Link><small>{project.client} · {project.manager}</small></div><div><span>{project.stage}</span><small>{project.status} · {deliverables.filter((d) => d.projectId === project.id).length} deliverables</small></div><div><span className={`rag-chip rag-${project.health.toLowerCase()}`}><i />{project.health}</span><small>{risks.filter((risk) => risk.project === project.name).length} risks</small></div><div><strong className={fee && fee.variance < 0 ? "text-risk" : "text-positive"}>{fee ? money(fee.variance) : "—"}</strong><small>forecast variance</small></div></div>; })}</div></article>
  </section>;
}
