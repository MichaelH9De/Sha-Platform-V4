export const projects = [
  { id: "civic-retrofit", name: "Civic Centre Retrofit", client: "Northbridge Borough Council", sector: "Public sector", manager: "Alex Morgan", status: "LIVE", health: "AMBER", stage: "RIBA 3 – Spatial Coordination", fee: 185000, forecast: 194500 },
  { id: "harbour-offices", name: "Harbour Exchange Offices", client: "West Quay Developments", sector: "Commercial", manager: "Priya Shah", status: "LIVE", health: "GREEN", stage: "RIBA 4 – Technical Design", fee: 248000, forecast: 241000 },
  { id: "riverside-health", name: "Riverside Health Campus", client: "Riverside Health Trust", sector: "Healthcare", manager: "Daniel Reed", status: "APPOINTED", health: "RED", stage: "RIBA 2 – Concept Design", fee: 320000, forecast: 347000 }
] as const;

export const deliverables = [
  { id: "d1", projectId: "civic-retrofit", project: "Civic Centre Retrofit", title: "Mechanical Stage 3 Design Note", owner: "Jamie Cole", discipline: "Mechanical", due: "24 Jun 2026", status: "IN_PROGRESS", qa: "IN_REVIEW", revision: "P02", issue: "Internal review" },
  { id: "d2", projectId: "civic-retrofit", project: "Civic Centre Retrofit", title: "Electrical Load Assessment", owner: "Amira Khan", discipline: "Electrical", due: "27 Jun 2026", status: "BLOCKED", qa: "CHANGES_REQUIRED", revision: "P01", issue: "Not issued" },
  { id: "d3", projectId: "harbour-offices", project: "Harbour Exchange Offices", title: "Coordinated Services Model", owner: "Lewis Grant", discipline: "BIM", due: "20 Jun 2026", status: "COMPLETE", qa: "APPROVED", revision: "P04", issue: "Issued" },
  { id: "d4", projectId: "harbour-offices", project: "Harbour Exchange Offices", title: "Lighting Control Philosophy", owner: "Amira Khan", discipline: "Electrical", due: "02 Jul 2026", status: "IN_PROGRESS", qa: "NOT_STARTED", revision: "P01", issue: "Not issued" },
  { id: "d5", projectId: "riverside-health", project: "Riverside Health Campus", title: "Energy Strategy Options", owner: "Sophie Turner", discipline: "Sustainability", due: "18 Jun 2026", status: "BLOCKED", qa: "NOT_STARTED", revision: "P01", issue: "Not issued" }
] as const;

export const risks = [
  { id: "r1", project: "Civic Centre Retrofit", severity: "HIGH", likelihood: "MEDIUM", description: "Existing plantroom survey information is incomplete.", mitigation: "Record assumptions and complete intrusive survey before Stage 3 gate.", owner: "Alex Morgan", status: "OPEN" },
  { id: "r2", project: "Riverside Health Campus", severity: "CRITICAL", likelihood: "HIGH", description: "Clinical brief changes may invalidate the current ventilation strategy.", mitigation: "Freeze departmental brief and hold client decision workshop.", owner: "Daniel Reed", status: "OPEN" },
  { id: "r3", project: "Harbour Exchange Offices", severity: "MEDIUM", likelihood: "LOW", description: "Incoming electrical capacity confirmation remains outstanding.", mitigation: "Track DNO response and retain load-shedding option.", owner: "Priya Shah", status: "IN_PROGRESS" }
] as const;

export const actions = [
  { id: "a1", project: "Civic Centre Retrofit", description: "Confirm plant replacement assumptions with architect", owner: "Jamie Cole", due: "21 Jun 2026", priority: "HIGH", status: "OPEN" },
  { id: "a2", project: "Riverside Health Campus", description: "Issue clinical ventilation decision paper", owner: "Daniel Reed", due: "19 Jun 2026", priority: "CRITICAL", status: "OVERDUE" },
  { id: "a3", project: "Harbour Exchange Offices", description: "Close model clash review comments", owner: "Lewis Grant", due: "25 Jun 2026", priority: "MEDIUM", status: "IN_PROGRESS" }
] as const;

export const fees = projects.map((project) => ({ project: project.name, agreed: project.fee, forecast: project.forecast, variance: project.fee - project.forecast, status: project.forecast > project.fee ? "AT RISK" : "ON TRACK" }));
export const resources = [
  { id: "res1", person: "Jamie Cole", discipline: "Mechanical", project: "Civic Centre Retrofit", planned: 32, capacity: 37.5, week: "22 Jun 2026" },
  { id: "res2", person: "Amira Khan", discipline: "Electrical", project: "Harbour Exchange Offices", planned: 41, capacity: 37.5, week: "22 Jun 2026" },
  { id: "res3", person: "Lewis Grant", discipline: "BIM", project: "Harbour Exchange Offices", planned: 28, capacity: 37.5, week: "22 Jun 2026" }
] as const;
export const qaReviews = deliverables.slice(0, 3).map((item, index) => ({ id: `qa${index}`, deliverable: item.title, project: item.project, reviewer: ["Priya Shah", "Daniel Reed", "Alex Morgan"][index], status: item.qa, action: index === 1 ? "Resolve load assumptions before approval" : "No outstanding critical action" }));
export const bimRecords = [
  { id: "b1", project: "Civic Centre Retrofit", model: "NBC-CCR-MEP-ZZ-M3-0001.rvt", discipline: "MEP", status: "COORDINATION", checked: "17 Jun 2026" },
  { id: "b2", project: "Harbour Exchange Offices", model: "WQD-HEX-MEP-ZZ-M4-0004.rvt", discipline: "MEP", status: "APPROVED", checked: "18 Jun 2026" }
] as const;
export const stages = projects.map((project, index) => ({ id: `s${index}`, project: project.name, name: project.stage, status: index === 2 ? "BLOCKED" : "IN_PROGRESS", gate: index === 1 ? "82% ready" : index === 0 ? "64% ready" : "38% ready" }));
export const appointments = projects.map((project, index) => ({ id: `ap${index}`, project: project.name, scope: "Multidisciplinary MEP design consultancy", basis: index === 1 ? "Time charge with cap" : "Fixed fee by stage", status: "OPEN" }));
export const decisions = [
  { id: "de1", project: "Civic Centre Retrofit", decision: "Retain existing low-temperature heating distribution", owner: "Alex Morgan", date: "16 Jun 2026", impact: "Reduces plantroom alteration scope", status: "APPROVED" },
  { id: "de2", project: "Riverside Health Campus", decision: "Clinical ventilation strategy", owner: "Client", date: "Pending", impact: "Programme-critical", status: "AWAITING DECISION" }
] as const;
export const informationRequests = [
  { id: "i1", project: "Civic Centre Retrofit", description: "Existing electrical maximum-demand records", from: "Client FM team", due: "23 Jun 2026", status: "OPEN" },
  { id: "i2", project: "Riverside Health Campus", description: "Final clinical room data sheets", from: "Healthcare planner", due: "19 Jun 2026", status: "OVERDUE" }
] as const;
export const clients = [...new Map(projects.map((project) => [project.client, { id: project.client, name: project.client, sector: project.sector, owner: project.manager }])).values()];
export const reports = projects.map((project, index) => ({ id: `rep${index}`, project: project.name, title: "Monthly Client Progress Report", audience: "CLIENT", status: index === 0 ? "DRAFT" : "ISSUED", date: `${15 + index} Jun 2026` }));
export const auditEvents = [
  { id: "au1", action: "QA_STATUS_UPDATE", entity: "Deliverable", actor: "Priya Shah", time: "18 Jun 2026 09:42" },
  { id: "au2", action: "RISK_UPDATE", entity: "Risk", actor: "Daniel Reed", time: "18 Jun 2026 09:18" },
  { id: "au3", action: "REPORT_GENERATED", entity: "Report", actor: "Alex Morgan", time: "17 Jun 2026 16:31" }
] as const;

export const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
