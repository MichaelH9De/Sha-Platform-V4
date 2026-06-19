"use server";

import { requireCurrentUser, requireInternalUser } from "@/lib/auth/session";
import { createDeliverable, updateDeliverableQaStatus } from "@/server/services/deliverable-service";

export async function createDeliverableAction(input: unknown) {
  const user = await requireCurrentUser();
  requireInternalUser(user);
  return createDeliverable(input, user);
}

export async function updateDeliverableQaAction(deliverableId: string, qaStatus: unknown, overrideReason?: string) {
  const user = await requireCurrentUser();
  requireInternalUser(user);
  return updateDeliverableQaStatus(deliverableId, qaStatus, user, overrideReason);
}
