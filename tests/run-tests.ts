import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { canAccessProject, canPerform, canViewField, filterFieldsForRole, isRoleName } from "../lib/permissions/policy";
import {
  deliverableCreateSchema,
  feeForecastSchema,
  projectCreateSchema,
  riskUpdateSchema
} from "../lib/validation/schemas";
import { buildClientFacingSnapshot } from "../lib/reporting/field-filter";
import { utilisationPercent } from "../lib/calculations/resources";
import { isDemoMode } from "../lib/demo-mode";
import { projects as demoProjects } from "../lib/demo-data";

const root = process.cwd();

function requireFile(file: string) {
  assert.ok(existsSync(path.join(root, file)), `Missing required file: ${file}`);
}

function testRequiredFiles() {
  [
    "package.json",
    "package-lock.json",
    ".env.example",
    "prisma/schema.prisma",
    "prisma/migrations/20260618000000_production_baseline/migration.sql",
    "prisma/seed.ts",
    "lib/permissions/policy.ts",
    "lib/validation/schemas.ts",
    "lib/audit/log.ts",
    "server/services/project-service.ts",
    "docs/ARCHITECTURE.md",
    "docs/DATA_MODEL.md",
    "docs/PERMISSIONS.md",
    "docs/ROADMAP.md",
    "docs/RELEASE_CRITERIA.md",
    "docs/SECURITY_NOTES.md"
  ].forEach(requireFile);
}

function testPackageScripts() {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  for (const script of ["dev", "build", "start", "lint", "test", "typecheck", "check", "db:migrate", "db:seed"]) {
    assert.ok(pkg.scripts?.[script], `Missing script: ${script}`);
  }
  assert.equal(pkg.scripts.lint, "eslint .");
  assert.equal(pkg.engines.node, "22.x");
}

function testPrismaSchema() {
  const schema = readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
  for (const model of [
    "User", "Role", "Permission", "Client", "Project", "Appointment", "Stage", "Discipline",
    "Deliverable", "Action", "Risk", "Decision", "InformationRequest", "FeeBudget", "FeeForecast",
    "ResourceAllocation", "QAReview", "BIMRecord", "Report", "ReportTemplate", "StageTemplate",
    "DeliverableTemplate", "AuditEvent"
  ]) {
    assert.match(schema, new RegExp(`model\\s+${model}\\s+{`), `Missing Prisma model ${model}`);
  }
}

function testPermissions() {
  assert.equal(canPerform("Director", "fee:update"), true);
  assert.equal(canPerform("Client/External", "fee:update"), false);
  assert.equal(canViewField("Client/External", "margin"), false);
  assert.equal(canViewField("Client/External", "internalQaComments"), false);
  assert.equal(canViewField("Engineer", "internalFeeForecast"), false);
  const filtered = filterFieldsForRole("Client/External", {
    projectName: "Demo",
    margin: 42,
    internalQaComments: "Sensitive"
  });
  assert.deepEqual(filtered, { projectName: "Demo" });
  assert.equal(canAccessProject("Director", [], "p1"), true);
  assert.equal(canAccessProject("Project Manager", ["p1"], "p1"), true);
  assert.equal(canAccessProject("Project Manager", ["p2"], "p1"), false);
  assert.equal(canAccessProject("Client/External", [], "p1"), false);
  assert.equal(isRoleName("Director"), true);
  assert.equal(isRoleName("Superuser"), false);
}

function testValidation() {
  assert.equal(projectCreateSchema.safeParse({ clientId: "", name: "No", sector: "", projectManagerId: "" }).success, false);
  assert.equal(projectCreateSchema.safeParse({ clientId: "c1", name: "Valid Project", sector: "Commercial", projectManagerId: "u1" }).success, true);
  assert.equal(deliverableCreateSchema.safeParse({ projectId: "p1", stageId: "s1", disciplineId: "d1", ownerId: "u1", title: "Drawing", dueDate: "2026-07-01" }).success, true);
  assert.equal(riskUpdateSchema.safeParse({ projectId: "p1", ownerId: "u1", description: "Risk", severity: "HIGH", likelihood: "MEDIUM", mitigation: "Mitigate", status: "OPEN" }).success, false);
  assert.equal(feeForecastSchema.safeParse({ projectId: "p1", actualHours: 10, forecastHours: 15, varianceValue: -100, status: "OPEN" }).success, true);
}

function testClientReportFiltering() {
  const snapshot = buildClientFacingSnapshot({
    projectName: "Civic Retrofit",
    stage: "Stage 3",
    status: "LIVE",
    margin: 0.22,
    internalCommercialNotes: "Do not show",
    internalQaComments: "Do not show",
    nextSteps: "Review"
  });
  assert.equal(snapshot.projectName, "Civic Retrofit");
  assert.equal(snapshot.nextSteps, "Review");
  assert.equal("margin" in snapshot, false);
  assert.equal("internalCommercialNotes" in snapshot, false);
  assert.equal("internalQaComments" in snapshot, false);
  assert.throws(() => buildClientFacingSnapshot({ projectName: { margin: 42 } }));
}

function testSecurityArchitecture() {
  const auth = readFileSync(path.join(root, "lib/auth/entra.ts"), "utf8");
  const protectedLayout = readFileSync(path.join(root, "app/(protected)/layout.tsx"), "utf8");
  const schema = readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
  const projectService = readFileSync(path.join(root, "server/services/project-service.ts"), "utf8");
  assert.match(auth, /exchangeAndValidateCode/);
  assert.match(auth, /pkceChallenge/);
  assert.match(auth, /RS256/);
  assert.match(protectedLayout, /requireCurrentUser/);
  assert.match(schema, /provider\s*=\s*"postgresql"/);
  assert.match(schema, /model\s+ProjectMember\s+{/);
  assert.match(projectService, /\$transaction/);
  assert.doesNotMatch(readFileSync(path.join(root, "lib/auth/session.ts"), "utf8"), /Demo Director/);
}

function testResourceCalculation() {
  assert.equal(utilisationPercent(20, 40), 50);
  assert.equal(utilisationPercent(20, 0), 0);
}

function testDemoMode() {
  const original = process.env.DEMO_MODE;
  process.env.DEMO_MODE = "true";
  assert.equal(isDemoMode(), true);
  process.env.DEMO_MODE = "false";
  assert.equal(isDemoMode(), false);
  if (original === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = original;
  assert.ok(demoProjects.length >= 3);
  const checkEnv = readFileSync(path.join(root, "scripts/check-env.mjs"), "utf8");
  assert.match(checkEnv, /DEMO_MODE/);
}

testRequiredFiles();
testPackageScripts();
testPrismaSchema();
testPermissions();
testValidation();
testClientReportFiltering();
testResourceCalculation();
testSecurityArchitecture();
testDemoMode();

console.log("Enterprise foundation tests passed.");
