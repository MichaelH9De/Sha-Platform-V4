import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  previousValue?: unknown;
  newValue?: unknown;
  actorId?: string;
  sourcePath?: string;
};

type AuditClient = Pick<Prisma.TransactionClient, "auditEvent">;

export async function writeAuditEvent(input: AuditInput, client: AuditClient = prisma) {
  return client.auditEvent.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      previousValue: input.previousValue === undefined ? undefined : JSON.stringify(input.previousValue),
      newValue: input.newValue === undefined ? undefined : JSON.stringify(input.newValue),
      actorId: input.actorId,
      sourcePath: input.sourcePath
    }
  });
}
