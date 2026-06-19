import { ArrowUpRight, LockKeyhole, Radio, Settings2, ShieldCheck, Users } from "lucide-react";

const controls = [
  { name: "People & roles", detail: "Demo identities and permission groups", status: "READ ONLY" },
  { name: "Disciplines", detail: "MEP capability and ownership structure", status: "CONFIGURED" },
  { name: "Project templates", detail: "Standard controls for new commissions", status: "PREVIEW" }
];

export default function Page() {
  return <section className="command-centre"><header className="command-header"><div className="command-title-group"><div className="command-kicker"><Radio size={14} /> Platform control</div><h1>Administration</h1><p>Prototype preview of roles, disciplines and platform templates.</p></div><span className="demo-status"><i /> Read-only demo</span></header>
    <div className="command-metrics"><article className="command-metric tone-cyan"><div className="metric-top"><span>Demo users</span><Users size={18} /></div><strong>7</strong><div className="metric-foot"><span>Fictional identities</span><ArrowUpRight size={14} /></div></article><article className="command-metric tone-cyan"><div className="metric-top"><span>Roles</span><ShieldCheck size={18} /></div><strong>5</strong><div className="metric-foot"><span>Permission profiles</span></div></article><article className="command-metric tone-cyan"><div className="metric-top"><span>Disciplines</span><Settings2 size={18} /></div><strong>5</strong><div className="metric-foot"><span>Capability groups</span></div></article><article className="command-metric tone-amber"><div className="metric-top"><span>Configuration</span><LockKeyhole size={18} /></div><strong>Locked</strong><div className="metric-foot"><span>Safe public prototype</span></div></article></div>
    <article className="command-panel"><div className="panel-heading"><div><span className="panel-label">Configuration areas</span><h2>Platform administration</h2></div><span className="panel-meta">Preview only</span></div><div className="project-register" role="table" aria-label="Administration areas"><div className="project-row project-row-head" role="row"><span>Control area</span><span>Purpose</span><span>Status</span><span>Access</span></div>{controls.map((control) => <div className="project-row" role="row" key={control.name}><div><strong>{control.name}</strong><small>Enterprise configuration</small></div><div><span>{control.detail}</span><small>Available after production setup</small></div><div><span className={`rag-chip ${control.status === "CONFIGURED" ? "rag-green" : "rag-amber"}`}><i />{control.status}</span></div><div><strong>Administrator</strong><small>Restricted control</small></div></div>)}</div></article>
  </section>;
}
