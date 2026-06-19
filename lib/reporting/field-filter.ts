import { filterFieldsForRole, RoleName } from "@/lib/permissions/policy";
import { z } from "zod";

export const clientReportAllowlist = [
  "projectName",
  "stage",
  "status",
  "health",
  "deliverableProgress",
  "openActions",
  "clientInformationRequired",
  "approvedDecisions",
  "nextSteps"
];

export const clientReportSchema = z.object({
  projectName: z.string().max(200).optional(),
  stage: z.string().max(100).optional(),
  status: z.string().max(100).optional(),
  health: z.string().max(100).optional(),
  deliverableProgress: z.union([z.string().max(500), z.number()]).optional(),
  openActions: z.array(z.string().max(500)).max(100).optional(),
  clientInformationRequired: z.array(z.string().max(500)).max(100).optional(),
  approvedDecisions: z.array(z.string().max(500)).max(100).optional(),
  nextSteps: z.union([z.string().max(2000), z.array(z.string().max(500)).max(100)]).optional()
}).strip();

export function buildClientFacingSnapshot(source: Record<string, unknown>) {
  return clientReportSchema.parse(source);
}

export function filterSnapshotForRole(role: RoleName, source: Record<string, unknown>) {
  return role === "Client/External" ? buildClientFacingSnapshot(source) : filterFieldsForRole(role, source);
}
