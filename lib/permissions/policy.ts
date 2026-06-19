export const sensitiveFields = [
  "margin",
  "utilisation",
  "staffingAllocation",
  "internalQaComments",
  "internalCommercialNotes",
  "internalFeeForecast",
  "draftRiskAssessment",
  "forecastHours",
  "varianceValue"
] as const;

export type SensitiveField = (typeof sensitiveFields)[number];

export type RoleName =
  | "Admin"
  | "Director"
  | "Project Director"
  | "Project Manager"
  | "Discipline Lead"
  | "Engineer"
  | "Finance"
  | "QA Reviewer"
  | "BIM Manager"
  | "Client/External";

export const roleNames: readonly RoleName[] = ["Admin", "Director", "Project Director", "Project Manager", "Discipline Lead", "Engineer", "Finance", "QA Reviewer", "BIM Manager", "Client/External"];

export function isRoleName(value: string): value is RoleName {
  return roleNames.includes(value as RoleName);
}

export type ActionKey =
  | "project:create"
  | "project:update"
  | "deliverable:create"
  | "deliverable:update"
  | "risk:update"
  | "fee:update"
  | "resource:update"
  | "qa:update"
  | "report:generate"
  | "admin:manage";

const roleActions: Record<RoleName, ActionKey[]> = {
  Admin: ["project:create", "project:update", "deliverable:create", "deliverable:update", "risk:update", "fee:update", "resource:update", "qa:update", "report:generate", "admin:manage"],
  Director: ["project:create", "project:update", "deliverable:create", "deliverable:update", "risk:update", "fee:update", "resource:update", "qa:update", "report:generate"],
  "Project Director": ["project:create", "project:update", "deliverable:create", "deliverable:update", "risk:update", "fee:update", "resource:update", "qa:update", "report:generate"],
  "Project Manager": ["project:create", "project:update", "deliverable:create", "deliverable:update", "risk:update", "qa:update", "report:generate"],
  "Discipline Lead": ["deliverable:create", "deliverable:update", "risk:update", "resource:update", "qa:update"],
  Engineer: ["deliverable:update", "risk:update"],
  Finance: ["fee:update", "report:generate"],
  "QA Reviewer": ["qa:update", "deliverable:update"],
  "BIM Manager": ["deliverable:update", "qa:update"],
  "Client/External": []
};

const externalBlocked = new Set<string>(sensitiveFields);

export function canPerform(role: RoleName, action: ActionKey): boolean {
  return roleActions[role]?.includes(action) ?? false;
}

export function canViewField(role: RoleName, field: string): boolean {
  if (role === "Client/External" && externalBlocked.has(field)) return false;
  if (role === "Engineer" && ["margin", "internalCommercialNotes", "internalFeeForecast", "varianceValue"].includes(field)) return false;
  if (role === "Finance" && ["internalQaComments", "draftRiskAssessment"].includes(field)) return false;
  return true;
}

export function filterFieldsForRole<T extends Record<string, unknown>>(role: RoleName, data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([key]) => canViewField(role, key))) as Partial<T>;
}

export function assertCan(role: RoleName, action: ActionKey) {
  if (!canPerform(role, action)) {
    throw new Error(`Role ${role} cannot perform ${action}`);
  }
}

const portfolioRoles = new Set<RoleName>(["Admin", "Director"]);

export function canAccessProject(role: RoleName, assignedProjectIds: readonly string[], projectId: string): boolean {
  return portfolioRoles.has(role) || assignedProjectIds.includes(projectId);
}

export function assertProjectAccess(role: RoleName, assignedProjectIds: readonly string[], projectId: string) {
  if (!canAccessProject(role, assignedProjectIds, projectId)) {
    throw new Error("Project access denied");
  }
}
