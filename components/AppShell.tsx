import Link from 'next/link';
import { BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, Database, FileText, Gauge, Settings, Users } from 'lucide-react';
import type { RoleName } from '@/lib/permissions/policy';
import type { LucideIcon } from 'lucide-react';

type NavItem = { href: string; label: string; icon: LucideIcon; roles?: RoleName[] };
const internalRoles: RoleName[] = ['Admin', 'Director', 'Project Director', 'Project Manager', 'Discipline Lead', 'Engineer', 'Finance', 'QA Reviewer', 'BIM Manager'];

const nav: NavItem[] = [
  { href: '/platform/dashboard', label: 'Command Centre', icon: Gauge },
  { href: '/platform/projects', label: 'Projects', icon: Building2 },
  { href: '/platform/deliverables', label: 'Deliverables', icon: ClipboardCheck },
  { href: '/platform/resources', label: 'Resources', icon: Users, roles: internalRoles },
  { href: '/platform/fees', label: 'Fees & Commercial', icon: BriefcaseBusiness, roles: internalRoles.filter((role) => role !== 'Engineer') },
  { href: '/platform/bim', label: 'BIM / Revit', icon: Database, roles: internalRoles },
  { href: '/platform/qa', label: 'QA & Stage Gates', icon: ClipboardCheck, roles: internalRoles },
  { href: '/platform/reports', label: 'Client Reports', icon: FileText },
  { href: '/platform/admin', label: 'Administration', icon: Settings, roles: ['Admin'] },
  { href: '/platform/audit', label: 'Audit', icon: BookOpen, roles: ['Admin', 'Director'] },
];

export function AppShell({ children, role }: { children: React.ReactNode; role: RoleName }) {
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <strong>MEP Consultancy Operating Platform</strong>
          <span>Secure consultancy project delivery, fee control, QA, BIM coordination and reporting.</span>
        </div>
        <nav className="nav">
          {nav.filter((item) => !item.roles || item.roles.includes(role)).map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="side-note">Access is identity-backed, project-scoped and audited. Contact an administrator if a project is missing.</div>
        <form action="/api/auth/signout" method="post"><button className="btn" type="submit">Sign out</button></form>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
