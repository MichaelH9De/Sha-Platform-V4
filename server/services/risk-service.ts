import { prisma } from "@/lib/db/client";
import { writeAuditEvent } from "@/lib/audit/log";
import { riskUpdateSchema } from "@/lib/validation/schemas";
import type { SessionUser } from "@/lib/auth/session";
import { assertCan, assertProjectAccess } from "@/lib/permissions/policy";

export async function createRisk(input: unknown, actor: SessionUser) {
  assertCan(actor.role, "risk:update");
  const data = riskUpdateSchema.parse(input);
  assertProjectAccess(actor.role, actor.projectIds, data.projectId);
  return prisma.$transaction(async (tx) => {
    const risk = await tx.risk.create({ data });
    await writeAuditEvent({ entityType: "Risk", entityId: risk.id, action: "CREATE", newValue: data, actorId: actor.id, sourcePath: "server/services/risk-service#createRisk" }, tx);
    return risk;
  });
}
