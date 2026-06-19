import { prisma } from "@/lib/db/client";
import { writeAuditEvent } from "@/lib/audit/log";
import { deliverableCreateSchema, qaStatusSchema } from "@/lib/validation/schemas";
import type { SessionUser } from "@/lib/auth/session";
import { assertCan, assertProjectAccess } from "@/lib/permissions/policy";

export async function createDeliverable(input: unknown, actor: SessionUser) {
  assertCan(actor.role, "deliverable:create");
  const data = deliverableCreateSchema.parse(input);
  assertProjectAccess(actor.role, actor.projectIds, data.projectId);
  const stage = await prisma.stage.findFirst({ where: { id: data.stageId, projectId: data.projectId }, select: { id: true } });
  if (!stage) throw new Error("Stage does not belong to this project");
  return prisma.$transaction(async (tx) => {
    const deliverable = await tx.deliverable.create({ data });
    await writeAuditEvent({ entityType: "Deliverable", entityId: deliverable.id, action: "CREATE", newValue: data, actorId: actor.id, sourcePath: "server/services/deliverable-service#createDeliverable" }, tx);
    return deliverable;
  });
}

export async function updateDeliverableQaStatus(deliverableId: string, qaStatus: unknown, actor: SessionUser, overrideReason?: string) {
  assertCan(actor.role, "qa:update");
  const parsedQaStatus = qaStatusSchema.parse(qaStatus);
  if (parsedQaStatus === "OVERRIDDEN" && !overrideReason) {
    throw new Error("QA override requires an override reason.");
  }
  const target = await prisma.deliverable.findUniqueOrThrow({ where: { id: deliverableId }, select: { projectId: true } });
  assertProjectAccess(actor.role, actor.projectIds, target.projectId);
  return prisma.$transaction(async (tx) => {
    const previous = await tx.deliverable.findUniqueOrThrow({ where: { id: deliverableId } });
    const updated = await tx.deliverable.update({ where: { id: deliverableId }, data: { qaStatus: parsedQaStatus, qaOverrideReason: parsedQaStatus === "OVERRIDDEN" ? overrideReason : null } });
    await writeAuditEvent({
      entityType: "Deliverable",
      entityId: deliverableId,
      action: "QA_STATUS_UPDATE",
      previousValue: { qaStatus: previous.qaStatus, qaOverrideReason: previous.qaOverrideReason },
      newValue: { qaStatus: parsedQaStatus, overrideReason },
      actorId: actor.id,
      sourcePath: "server/services/deliverable-service#updateDeliverableQaStatus"
    }, tx);
    return updated;
  });
}
