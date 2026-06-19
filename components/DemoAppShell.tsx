"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, Database, FileText, Gauge, Settings, Users } from "lucide-react";

const nav = [
  ["/demo/dashboard", "Command Centre", Gauge], ["/demo/projects", "Projects", Building2], ["/demo/deliverables", "Deliverables", ClipboardCheck],
  ["/demo/risks", "Risks", ClipboardCheck], ["/demo/actions", "Actions", ClipboardCheck], ["/demo/resources", "Resources", Users],
  ["/demo/fees", "Fees & Commercial", BriefcaseBusiness], ["/demo/bim", "BIM / Revit", Database], ["/demo/qa", "QA & Stage Gates", ClipboardCheck],
  ["/demo/reports", "Client Reports", FileText], ["/demo/admin", "Administration", Settings], ["/demo/audit", "Audit", BookOpen]
] as const;

export function DemoAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="shell demo-shell"><aside className="sidebar demo-sidebar" aria-label="Demo navigation"><div className="brand demo-brand"><span className="brand-mark">MEP</span><div><strong>Consultancy OS</strong><span>Project intelligence platform</span></div></div><nav className="nav demo-nav">{nav.map(([href, label, Icon]) => { const active = pathname === href || (href !== "/demo/dashboard" && pathname.startsWith(`${href}/`)); return <Link href={href} key={href} className={active ? "active" : undefined}><Icon size={18} aria-hidden="true" /><span>{label}</span>{active ? <i aria-hidden="true" /> : null}</Link>; })}</nav><div className="side-note demo-note"><span className="demo-note-label"><i /> Prototype online</span><p>Fictional data only. Enterprise persistence and identity remain available for the production phase.</p></div></aside><main className="main demo-main">{children}</main></div>;
}
