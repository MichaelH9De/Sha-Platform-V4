import { prisma } from "@/lib/db/client";
import { writeAuditEvent } from "@/lib/audit/log";
import { buildClientFacingSnapshot } from "@/lib/reporting/field-filter";
import type { SessionUser } from "@/lib/auth/session";
import { assertCan, assertProjectAccess } from "@/lib/permissions/policy";

export async function generateClientReport(input: {
  projectId: string;
  templateId: string;
  snapshotSource: Record<string, unknown>;
}, actor: SessionUser) {
  assertCan(actor.role, "report:generate");
  assertProjectAccess(actor.role, actor.projectIds, input.projectId);
  const snapshot = buildClientFacingSnapshot(input.snapshotSource);
  return prisma.$transaction(async (tx) => {
    await tx.reportTemplate.findFirstOrThrow({ where: { id: input.templateId, audience: "CLIENT" } });
    const report = await tx.report.create({
      data: {
        projectId: input.projectId,
        templateId: input.templateId,
        audience: "CLIENT",
        status: "DRAFT",
        generatedById: actor.id,
        snapshotJson: JSON.stringify(snapshot)
      }
    });
    await writeAuditEvent({
      entityType: "Report",
      entityId: report.id,
      action: "GENERATE_CLIENT_REPORT",
      newValue: { includedFields: Object.keys(snapshot) },
      actorId: actor.id,
      sourcePath: "server/services/report-service#generateClientReport"
    }, tx);
    return report;
  });
}
