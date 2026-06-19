CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INVITED', 'DISABLED');
CREATE TYPE "ProjectStatus" AS ENUM ('ENQUIRY', 'APPOINTED', 'LIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "HealthStatus" AS ENUM ('GREEN', 'AMBER', 'RED');
CREATE TYPE "RecordStatus" AS ENUM ('DRAFT', 'OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE', 'CLOSED', 'CANCELLED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "QAStatus" AS ENUM ('NOT_STARTED', 'IN_REVIEW', 'CHANGES_REQUIRED', 'APPROVED', 'OVERRIDDEN');
CREATE TYPE "ReportAudience" AS ENUM ('INTERNAL', 'CLIENT', 'EXTERNAL_DESIGN_TEAM');

CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

CREATE TABLE "Permission" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

CREATE TABLE "RolePermission" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Discipline" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Discipline_code_key" ON "Discipline"("code");

CREATE TABLE "StageTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  CONSTRAINT "StageTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "contactOwnerId" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "projectManagerId" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'ENQUIRY',
  "health" "HealthStatus" NOT NULL DEFAULT 'AMBER',
  "stageTemplateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Project_projectManagerId_idx" ON "Project"("projectManagerId");
CREATE INDEX "Project_status_health_idx" ON "Project"("status", "health");

CREATE TABLE "ProjectMember" (
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "disciplineId" TEXT,
  "canManage" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("projectId", "userId")
);
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "scopeSummary" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "feeBasis" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScopeItem" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "disciplineId" TEXT,
  "description" TEXT NOT NULL,
  "included" BOOLEAN NOT NULL DEFAULT true,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  CONSTRAINT "ScopeItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliverableTemplate" (
  "id" TEXT NOT NULL,
  "stageTemplateId" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "DeliverableTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stage" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "plannedStart" TIMESTAMP(3),
  "plannedEnd" TIMESTAMP(3),
  "actualStatus" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "ownerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Stage_projectId_order_key" ON "Stage"("projectId", "order");

CREATE TABLE "Deliverable" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "stageId" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "qaStatus" "QAStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "revision" TEXT NOT NULL DEFAULT 'P01',
  "issueStatus" TEXT NOT NULL DEFAULT 'Not issued',
  "qaOverrideReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Deliverable_projectId_stageId_disciplineId_idx" ON "Deliverable"("projectId", "stageId", "disciplineId");
CREATE INDEX "Deliverable_ownerId_dueDate_idx" ON "Deliverable"("ownerId", "dueDate");

CREATE TABLE "Action" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Risk" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "likelihood" "Severity" NOT NULL,
  "mitigation" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Decision" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "impact" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InformationRequest" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "requiredFrom" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InformationRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeeBudget" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "budgetHours" DOUBLE PRECISION NOT NULL,
  "budgetValue" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeBudget_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeeBudget_projectId_disciplineId_key" ON "FeeBudget"("projectId", "disciplineId");

CREATE TABLE "FeeForecast" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "actualHours" DOUBLE PRECISION NOT NULL,
  "forecastHours" DOUBLE PRECISION NOT NULL,
  "varianceValue" DOUBLE PRECISION NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeeForecast_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResourceAllocation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "plannedHours" DOUBLE PRECISION NOT NULL,
  "capacityHours" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ResourceAllocation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResourceAllocation_userId_weekStart_idx" ON "ResourceAllocation"("userId", "weekStart");

CREATE TABLE "QAReview" (
  "id" TEXT NOT NULL,
  "deliverableId" TEXT NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "status" "QAStatus" NOT NULL DEFAULT 'IN_REVIEW',
  "comments" TEXT,
  "internalComments" TEXT,
  "requiredActions" TEXT,
  "approvalState" TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QAReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BIMRecord" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "modelReference" TEXT NOT NULL,
  "disciplineId" TEXT NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'OPEN',
  "lastCheckedAt" TIMESTAMP(3),
  "cdeLink" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BIMRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "audience" "ReportAudience" NOT NULL,
  "allowlistedFields" TEXT NOT NULL,
  CONSTRAINT "ReportTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "audience" "ReportAudience" NOT NULL,
  "status" "RecordStatus" NOT NULL DEFAULT 'DRAFT',
  "generatedById" TEXT NOT NULL,
  "snapshotJson" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "previousValue" TEXT,
  "newValue" TEXT,
  "actorId" TEXT,
  "sourcePath" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_contactOwnerId_fkey" FOREIGN KEY ("contactOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_stageTemplateId_fkey" FOREIGN KEY ("stageTemplateId") REFERENCES "StageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScopeItem" ADD CONSTRAINT "ScopeItem_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScopeItem" ADD CONSTRAINT "ScopeItem_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DeliverableTemplate" ADD CONSTRAINT "DeliverableTemplate_stageTemplateId_fkey" FOREIGN KEY ("stageTemplateId") REFERENCES "StageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeliverableTemplate" ADD CONSTRAINT "DeliverableTemplate_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Action" ADD CONSTRAINT "Action_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InformationRequest" ADD CONSTRAINT "InformationRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InformationRequest" ADD CONSTRAINT "InformationRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeeBudget" ADD CONSTRAINT "FeeBudget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeeBudget" ADD CONSTRAINT "FeeBudget_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FeeForecast" ADD CONSTRAINT "FeeForecast_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceAllocation" ADD CONSTRAINT "ResourceAllocation_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QAReview" ADD CONSTRAINT "QAReview_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QAReview" ADD CONSTRAINT "QAReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BIMRecord" ADD CONSTRAINT "BIMRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BIMRecord" ADD CONSTRAINT "BIMRecord_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ReportTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE FUNCTION "prevent_audit_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditEvent rows are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditEvent_append_only"
BEFORE UPDATE OR DELETE ON "AuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_audit_event_mutation"();
