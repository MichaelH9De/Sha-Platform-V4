import { Activity, AlertTriangle, ArrowUpRight, BriefcaseBusiness, CalendarDays, ClipboardCheck, Radio, Search } from "lucide-react";
import { actions, deliverables, fees, money, projects, resources, risks } from "@/lib/demo-data";

export default function Page() {
  const red = projects.filter((project) => project.health === "RED").length;
  const amber = projects.filter((project) => project.health === "AMBER").length;
  const green = projects.filter((project) => project.health === "GREEN").length;
  const overdue = actions.filter((action) => action.status === "OVERDUE").length;
  const blocked = deliverables.filter((deliverable) => deliverable.status === "BLOCKED").length;
  const complete = deliverables.filter((deliverable) => deliverable.status === "COMPLETE").length;
  const inProgress = deliverables.filter((deliverable) => deliverable.status === "IN_PROGRESS").length;
  const exposure = fees.filter((fee) => fee.variance < 0).reduce((total, fee) => total + Math.abs(fee.variance), 0);
  const feePoints = fees.map((fee, index) => `${18 + index * 92},${92 - Math.min(64, Math.abs(fee.variance) / 500)}`).join(" ");

  const metrics = [
    { label: "Live portfolio", value: projects.length, note: "3 active commissions", tone: "cyan", icon: Activity },
    { label: "Projects at risk", value: red, note: `${amber} further amber`, tone: "magenta", icon: AlertTriangle },
    { label: "Overdue actions", value: overdue, note: `${actions.length} actions tracked`, tone: "magenta", icon: ClipboardCheck },
    { label: "Fee exposure", value: money(exposure), note: "Forecast above agreed fee", tone: "amber", icon: BriefcaseBusiness }
  ] as const;

  return (
    <section className="command-centre">
      <header className="command-header">
        <div className="command-title-group">
          <div className="command-kicker"><Radio size={14} aria-hidden="true" /> Live project control</div>
          <h1>Director Command Centre</h1>
          <p>Portfolio performance, delivery risk and commercial exposure in one operational view.</p>
        </div>
        <div className="command-tools" aria-label="Dashboard controls">
          <span className="demo-status"><i /> Demo data</span>
          <div className="command-search"><Search size={16} aria-hidden="true" /><span>Search projects</span><kbd>⌘ K</kbd></div>
          <div className="period-control"><CalendarDays size={16} aria-hidden="true" /><span>Reporting period</span><strong>June 2026</strong></div>
        </div>
      </header>

      <div className="command-metrics">
        {metrics.map(({ label, value, note, tone, icon: Icon }) => (
          <article className={`command-metric tone-${tone}`} key={label}>
            <div className="metric-top"><span>{label}</span><Icon size={18} aria-hidden="true" /></div>
            <strong>{value}</strong>
            <div className="metric-foot"><span>{note}</span><ArrowUpRight size={14} aria-hidden="true" /></div>
          </article>
        ))}
      </div>

      <div className="command-primary-grid">
        <article className="command-panel portfolio-panel">
          <div className="panel-heading"><div><span className="panel-label">Portfolio health</span><h2>Live project register</h2></div><span className="panel-meta">Updated 09:42</span></div>
          <div className="project-register" role="table" aria-label="Portfolio health register">
            <div className="project-row project-row-head" role="row"><span>Project</span><span>Stage</span><span>Health</span><span>Commercial</span></div>
            {projects.map((project) => {
              const fee = fees.find((item) => item.project === project.name);
              return <div className="project-row" role="row" key={project.id}><div><strong>{project.name}</strong><small>{project.client} · {project.manager}</small></div><div><span>{project.stage}</span><small>{project.status}</small></div><div><span className={`rag-chip rag-${project.health.toLowerCase()}`}><i />{project.health}</span></div><div><strong className={fee && fee.variance < 0 ? "text-risk" : "text-positive"}>{fee ? money(fee.variance) : "—"}</strong><small>forecast variance</small></div></div>;
            })}
          </div>
        </article>

        <aside className="command-panel focus-panel">
          <div className="panel-heading"><div><span className="panel-label">Control focus</span><h2>Requires attention</h2></div><span className="pulse-dot" aria-label="Live updates" /></div>
          <div className="focus-score"><span>Critical controls</span><strong>{red + overdue + blocked}</strong></div>
          <div className="focus-list">
            <div className="focus-item risk"><span className="focus-icon"><AlertTriangle size={17} /></span><div><strong>{risks.length} active design risks</strong><small>{risks.filter((risk) => risk.severity === "CRITICAL").length} critical severity</small></div></div>
            <div className="focus-item commercial"><span className="focus-icon"><BriefcaseBusiness size={17} /></span><div><strong>{money(exposure)} fee exposure</strong><small>Forecast exceeds agreed fee</small></div></div>
            <div className="focus-item warning"><span className="focus-icon"><ClipboardCheck size={17} /></span><div><strong>{blocked} blocked deliverables</strong><small>{overdue} overdue action requires escalation</small></div></div>
          </div>
        </aside>
      </div>

      <div className="analytics-grid">
        <article className="command-panel chart-panel">
          <div className="panel-heading"><div><span className="panel-label">Risk profile</span><h3>Portfolio RAG distribution</h3></div><span className="panel-meta">{projects.length} projects</span></div>
          <div className="rag-visual"><div className="rag-donut" style={{ background: `conic-gradient(#21d4d4 0 ${green / projects.length * 100}%, #f0ad3d ${green / projects.length * 100}% ${(green + amber) / projects.length * 100}%, #ee3d8f ${(green + amber) / projects.length * 100}% 100%)` }}><span><strong>{green}</strong> healthy</span></div><div className="chart-legend"><span><i className="cyan" />Green <strong>{green}</strong></span><span><i className="amber" />Amber <strong>{amber}</strong></span><span><i className="magenta" />Red <strong>{red}</strong></span></div></div>
        </article>

        <article className="command-panel chart-panel">
          <div className="panel-heading"><div><span className="panel-label">Commercial</span><h3>Fee exposure trend</h3></div><span className="trend-negative">+{money(exposure)} risk</span></div>
          <svg className="trend-chart" viewBox="0 0 220 110" role="img" aria-label="Fee exposure trend across three projects"><title>Fee exposure trend</title><defs><linearGradient id="feeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ee3d8f" stopOpacity=".35"/><stop offset="1" stopColor="#ee3d8f" stopOpacity="0"/></linearGradient></defs><path d={`M ${feePoints} L 202 104 L 18 104 Z`} fill="url(#feeFill)"/><polyline points={feePoints} fill="none" stroke="#ff579d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{fees.map((fee, index) => <circle key={fee.project} cx={18 + index * 92} cy={92 - Math.min(64, Math.abs(fee.variance) / 500)} r="4" fill="#09111f" stroke="#ff72b1" strokeWidth="3"/>)}</svg>
          <div className="chart-axis"><span>Concept</span><span>Coordination</span><span>Technical</span></div>
        </article>

        <article className="command-panel chart-panel">
          <div className="panel-heading"><div><span className="panel-label">Delivery</span><h3>Deliverable status</h3></div><span className="panel-meta">{deliverables.length} total</span></div>
          <div className="status-bars"><div><span>In progress <strong>{inProgress}</strong></span><div><i className="cyan" style={{ width: `${inProgress / deliverables.length * 100}%` }} /></div></div><div><span>Blocked <strong>{blocked}</strong></span><div><i className="magenta" style={{ width: `${blocked / deliverables.length * 100}%` }} /></div></div><div><span>Complete <strong>{complete}</strong></span><div><i className="positive" style={{ width: `${complete / deliverables.length * 100}%` }} /></div></div></div>
        </article>

        <article className="command-panel chart-panel">
          <div className="panel-heading"><div><span className="panel-label">People</span><h3>Resource pressure</h3></div><span className="panel-meta">Weekly capacity</span></div>
          <div className="resource-bars">{resources.map((resource) => { const load = Math.round(resource.planned / resource.capacity * 100); return <div key={resource.id}><span><strong>{resource.person}</strong><em>{load}%</em></span><div><i className={load > 100 ? "over" : "normal"} style={{ width: `${Math.min(load, 100)}%` }} /></div><small>{resource.discipline} · {resource.project}</small></div>; })}</div>
        </article>
      </div>
    </section>
  );
}
