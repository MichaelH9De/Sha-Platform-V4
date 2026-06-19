import { z } from "zod";

export const recordStatusSchema = z.enum(["DRAFT", "OPEN", "IN_PROGRESS", "BLOCKED", "COMPLETE", "CLOSED", "CANCELLED"]);
export const projectStatusSchema = z.enum(["ENQUIRY", "APPOINTED", "LIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]);
export const healthSchema = z.enum(["GREEN", "AMBER", "RED"]);
export const severitySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const qaStatusSchema = z.enum(["NOT_STARTED", "IN_REVIEW", "CHANGES_REQUIRED", "APPROVED", "OVERRIDDEN"]);

export const projectCreateSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(3),
  sector: z.string().min(2),
  projectManagerId: z.string().min(1),
  status: projectStatusSchema.default("ENQUIRY"),
  health: healthSchema.default("AMBER"),
  stageTemplateId: z.string().optional()
});

export const deliverableCreateSchema = z.object({
  projectId: z.string().min(1),
  stageId: z.string().min(1),
  disciplineId: z.string().min(1),
  ownerId: z.string().min(1),
  title: z.string().min(3),
  dueDate: z.coerce.date(),
  status: recordStatusSchema.default("OPEN"),
  qaStatus: qaStatusSchema.default("NOT_STARTED")
});

export const riskUpdateSchema = z.object({
  projectId: z.string().min(1),
  ownerId: z.string().min(1),
  description: z.string().min(5),
  severity: severitySchema,
  likelihood: severitySchema,
  mitigation: z.string().min(5),
  status: recordStatusSchema.default("OPEN")
});

export const feeForecastSchema = z.object({
  projectId: z.string().min(1),
  actualHours: z.number().nonnegative(),
  forecastHours: z.number().nonnegative(),
  varianceValue: z.number(),
  status: recordStatusSchema.default("OPEN"),
  notes: z.string().optional()
});

export const resourceAllocationSchema = z.object({
  userId: z.string().min(1),
  projectId: z.string().min(1),
  disciplineId: z.string().min(1),
  weekStart: z.coerce.date(),
  plannedHours: z.number().min(0).max(60),
  capacityHours: z.number().min(0).max(60)
});

export const qaReviewSchema = z.object({
  deliverableId: z.string().min(1),
  reviewerId: z.string().min(1),
  status: qaStatusSchema,
  comments: z.string().optional(),
  internalComments: z.string().optional(),
  requiredActions: z.string().optional(),
  approvalState: z.string().min(1)
});
