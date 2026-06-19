"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, ClipboardCheck, Radio, ShieldAlert } from "lucide-react";
import { actions, deliverables, money, risks } from "@/lib/demo-data";
import { getDemoProject, seedDemoProjects, type DemoProject } from "@/lib/demo-project-store";

export function DemoProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<DemoProject | undefined>(() => seedDemoProjects.find((item) => item.id === projectId));
  const [ready, setReady] = useState(Boolean(project));

  useEffect(() => { setProject(getDemoProject(projectId)); setReady(true); }, [projectId]);

  if (!ready) return <section className="command-centre"><article className="command-panel demo-empty-state">Loading project…</article></section>;
  if (!project) return <section className="command-centre"><article className="command-panel demo-empty-state"><h1>Project not found</h1><p>This browser does not contain that local demo project.</p><Link className="demo-primary-button" href="/demo/projects"><ArrowLeft size={16} /> Back to projects</Link></article></section>;

  const projectDeliverables = deliverables.filter((item) => item.projectId === project.id);
  const projectRisks = risks.filter((item) => item.project === project.name);
  const projectActions = actions.filter((item) => item.project === project.name);

  return <section className="command-centre">
    <header className="command-header"><div className="command-title-group"><div className="command-kicker"><Radio size={14} /> Project workspace</div><h1>{project.name}</h1><p>{project.client} · {project.sector} · managed by {project.manager}</p></div><div className="command-tools"><span className={`rag-chip rag-${project.health.toLowerCase()}`}><i />{project.health}</span><Link className="demo-secondary-button" href="/demo/projects"><ArrowLeft size={16} /> Projects</Link></div></header>
    <div className="command-metrics"><article className="command-metric tone-cyan"><div className="metric-top"><span>Project stage</span><ClipboardCheck size={18} /></div><strong className="demo-stage-value">{project.stage.split("–")[0].trim()}</strong><div className="metric-foot"><span>{project.stage}</span></div></article><article className={`command-metric ${project.health === "RED" ? "tone-magenta" : project.health === "AMBER" ? "tone-amber" : "tone-cyan"}`}><div className="metric-top"><span>Health</span><ShieldAlert size={18} /></div><strong>{project.health}</strong><div className="metric-foot"><span>Current RAG assessment</span></div></article><article className="command-metric tone-cyan"><div className="metric-top"><span>Agreed fee</span><BriefcaseBusiness size={18} /></div><strong>{project.source === "local" ? "—" : money(project.fee)}</strong><div className="metric-foot"><span>{project.source === "local" ? "Not configured in prototype" : "Current appointment"}</span></div></article><article className="command-metric tone-cyan"><div className="metric-top"><span>Status</span><Radio size={18} /></div><strong>{project.status}</strong><div className="metric-foot"><span>{project.source === "local" ? "Browser-local record" : "Seed demo project"}</span></div></article></div>
    <div className="command-primary-grid"><article className="command-panel demo-summary-panel"><div className="panel-heading"><div><span className="panel-label">Project overview</span><h2>Commission summary</h2></div><span className="panel-meta">{project.sector}</span></div><p>{project.summary}</p></article><aside className="command-panel focus-panel"><div className="panel-heading"><div><span className="panel-label">Control position</span><h2>Current records</h2></div></div><div className="focus-list"><div className="focus-item warning"><span className="focus-icon"><ClipboardCheck size={17} /></span><div><strong>{projectDeliverables.length} deliverables</strong><small>Project output register</small></div></div><div className="focus-item risk"><span className="focus-icon"><ShieldAlert size={17} /></span><div><strong>{projectRisks.length} risks</strong><small>Active project exposure</small></div></div><div className="focus-item warning"><span className="focus-icon"><Radio size={17} /></span><div><strong>{projectActions.length} actions</strong><small>Delivery controls</small></div></div></div></aside></div>
    {project.source === "local" && <div className="demo-prototype-note">This project is saved only in this browser for prototype demonstration purposes.</div>}
  </section>;
}
