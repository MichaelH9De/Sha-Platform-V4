import { prisma } from "@/lib/db/client";
import { writeAuditEvent } from "@/lib/audit/log";
import { projectCreateSchema } from "@/lib/validation/schemas";
import type { SessionUser } from "@/lib/auth/session";
import { assertCan } from "@/lib/permissions/policy";

export async function createProject(input: unknown, actor: SessionUser) {
  assertCan(actor.role, "project:create");
  const data = projectCreateSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({ data });
    await tx.projectMember.createMany({
      data: [
        { projectId: project.id, userId: actor.id, canManage: true },
        { projectId: project.id, userId: data.projectManagerId, canManage: true }
      ],
      skipDuplicates: true
    });
    await writeAuditEvent({
      entityType: "Project",
      entityId: project.id,
      action: "CREATE",
      newValue: data,
      actorId: actor.id,
      sourcePath: "server/services/project-service#createProject"
    }, tx);
    return project;
  });
}
