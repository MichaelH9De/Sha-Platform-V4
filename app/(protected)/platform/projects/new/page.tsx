import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/db/client";
import { requireCurrentUser } from "@/lib/auth/session";
import { assertCan } from "@/lib/permissions/policy";
import { createProjectFormAction } from "@/server/actions/project-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireCurrentUser();
  assertCan(user.role, "project:create");
  const [clients, managers, templates] = await Promise.all([
    prisma.client.findMany({ where: { status: { not: "CANCELLED" } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { status: "ACTIVE", role: { name: { in: ["Admin", "Director", "Project Director", "Project Manager"] } } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.stageTemplate.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
  ]);
  return (
    <section className="stack">
      <PageHeader eyebrow="Controlled workflow" title="New Project">Validation, permission checks, persistence, membership assignment and audit logging execute as one workflow.</PageHeader>
      <div className="panel">
        <form action={createProjectFormAction} className="stack">
          <label>Project name<input name="name" required minLength={3} /></label>
          <label>Sector<input name="sector" required minLength={2} /></label>
          <label>Client<select name="clientId" required><option value="">Select client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <label>Project manager<select name="projectManagerId" required><option value="">Select manager</option>{managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}</select></label>
          <label>Stage template<select name="stageTemplateId"><option value="">No template</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="ENQUIRY"><option>ENQUIRY</option><option>APPOINTED</option><option>LIVE</option><option>ON_HOLD</option></select></label>
          <label>Health<select name="health" defaultValue="AMBER"><option>GREEN</option><option>AMBER</option><option>RED</option></select></label>
          <button className="btn primary" type="submit">Create project</button>
        </form>
      </div>
    </section>
  );
}
