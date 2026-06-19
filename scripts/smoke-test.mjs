import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "package.json",
  "package-lock.json",
  ".env.example",
  "next.config.mjs",
  ".gitignore",
  "scripts/check-env.mjs",
  "scripts/audit-package.mjs",
  "vercel.json",
  "prisma/schema.prisma",
  "prisma/migrations/20260618000000_production_baseline/migration.sql",
  "prisma/seed.ts",
  "lib/permissions/policy.ts",
  "lib/demo-mode.ts",
  "lib/demo-data.ts",
  "lib/validation/schemas.ts",
  "lib/audit/log.ts",
  "lib/auth/entra.ts",
  "app/api/auth/callback/route.ts",
  "server/services/project-service.ts",
  "app/api/health/route.ts"
  ,"app/demo/dashboard/page.tsx"
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length) {
  console.error(`Smoke test failed. Missing files: ${missing.join(", ")}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
for (const script of ["dev", "build", "vercel-build", "start", "lint", "test", "typecheck", "check", "smoke-test", "package:audit", "env:check", "db:migrate", "db:deploy", "db:seed"]) {
  if (!pkg.scripts?.[script]) {
    console.error(`Smoke test failed. Missing package script: ${script}`);
    process.exit(1);
  }
}

const schema = readFileSync("prisma/schema.prisma", "utf8");
for (const model of ["Project", "ProjectMember", "Deliverable", "Risk", "FeeForecast", "ResourceAllocation", "QAReview", "AuditEvent"]) {
  if (!schema.includes(`model ${model}`)) {
    console.error(`Smoke test failed. Missing Prisma model: ${model}`);
    process.exit(1);
  }
}

const envCheck = readFileSync("scripts/check-env.mjs", "utf8");
if (!envCheck.includes("DEMO_MODE") || !envCheck.includes("process.exit(0)")) {
  console.error("Smoke test failed. Demo mode must bypass enterprise environment requirements.");
  process.exit(1);
}

if (!schema.includes('provider = "postgresql"')) {
  console.error("Smoke test failed. PostgreSQL must be the deployment datasource.");
  process.exit(1);
}

const lockfile = readFileSync("package-lock.json", "utf8");
if (lockfile.includes("internal.api.openai.org") || !lockfile.includes("https://registry.npmjs.org/")) {
  console.error("Smoke test failed. Lockfile must use the public npm registry.");
  process.exit(1);
}

const session = readFileSync("lib/auth/session.ts", "utf8");
const entra = readFileSync("lib/auth/entra.ts", "utf8");
const protectedLayout = readFileSync("app/(protected)/layout.tsx", "utf8");
const migration = readFileSync("prisma/migrations/20260618000000_production_baseline/migration.sql", "utf8");
for (const [label, ok] of [
  ["hardcoded identity removed", !session.includes("Demo Director")],
  ["protected layout enforces a user", protectedLayout.includes("requireCurrentUser")],
  ["OIDC PKCE is implemented", entra.includes("pkceChallenge")],
  ["OIDC signature validation is implemented", entra.includes("RSA-SHA256")],
  ["project membership migration exists", migration.includes('CREATE TABLE "ProjectMember"')],
  ["audit rows are append-only", migration.includes('CREATE TRIGGER "AuditEvent_append_only"')]
]) {
  if (!ok) {
    console.error(`Smoke test failed. Security control missing: ${label}`);
    process.exit(1);
  }
}

console.log("Smoke test passed. Enterprise foundation files, scripts and schema detected.");
