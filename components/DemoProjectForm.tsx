"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Radio, Save } from "lucide-react";
import { createDemoProject, type NewDemoProject, type ProjectHealth } from "@/lib/demo-project-store";

const initialProject: NewDemoProject = { name: "", client: "", sector: "", manager: "", stage: "RIBA 1 – Preparation and Briefing", health: "GREEN", summary: "" };

export function DemoProjectForm() {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof NewDemoProject>(field: K, value: NewDemoProject[K]) {
    setProject((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const saved = createDemoProject({
      ...project,
      name: project.name.trim(), client: project.client.trim(), sector: project.sector.trim(),
      manager: project.manager.trim(), summary: project.summary.trim()
    });
    router.push(`/demo/projects/${saved.id}`);
  }

  return <section className="command-centre">
    <header className="command-header"><div className="command-title-group"><div className="command-kicker"><Radio size={14} /> Project setup</div><h1>Create Project</h1><p>Add a commission to this browser-based prototype workspace.</p></div><span className="demo-status"><i /> Local demo record</span></header>
    <form className="command-panel demo-project-form" onSubmit={submit}>
      <div className="panel-heading"><div><span className="panel-label">Commission details</span><h2>Project information</h2></div><span className="panel-meta">All fields required</span></div>
      <div className="demo-form-grid">
        <label><span>Project name</span><input required value={project.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Central Library Renewal" /></label>
        <label><span>Client</span><input required value={project.client} onChange={(e) => update("client", e.target.value)} placeholder="Client organisation" /></label>
        <label><span>Sector</span><input required value={project.sector} onChange={(e) => update("sector", e.target.value)} placeholder="e.g. Commercial" /></label>
        <label><span>Project manager</span><input required value={project.manager} onChange={(e) => update("manager", e.target.value)} placeholder="Responsible lead" /></label>
        <label><span>Current stage</span><select required value={project.stage} onChange={(e) => update("stage", e.target.value)}><option>RIBA 0 – Strategic Definition</option><option>RIBA 1 – Preparation and Briefing</option><option>RIBA 2 – Concept Design</option><option>RIBA 3 – Spatial Coordination</option><option>RIBA 4 – Technical Design</option><option>RIBA 5 – Manufacturing and Construction</option><option>RIBA 6 – Handover</option><option>RIBA 7 – Use</option></select></label>
        <label><span>RAG status</span><select value={project.health} onChange={(e) => update("health", e.target.value as ProjectHealth)}><option value="GREEN">Green — healthy</option><option value="AMBER">Amber — attention required</option><option value="RED">Red — intervention required</option></select></label>
        <label className="demo-form-wide"><span>Project summary</span><textarea required value={project.summary} onChange={(e) => update("summary", e.target.value)} placeholder="Briefly describe the scope, objectives and current position." /></label>
      </div>
      <div className="demo-form-actions"><Link className="demo-secondary-button" href="/demo/projects"><ArrowLeft size={16} /> Cancel</Link><button className="demo-primary-button" type="submit" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save project"}</button></div>
    </form>
  </section>;
}
