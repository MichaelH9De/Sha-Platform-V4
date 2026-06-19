import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const files = [];
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (/\.(ts|tsx|mjs)$/.test(target)) files.push(target);
  }
}
for (const root of ["app", "components", "lib", "server", "tests", "prisma"]) if (existsSync(root)) walk(root);

const missingImports = [];
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/from\s+["'](@\/[^"']+|\.{1,2}\/[^"']+)["']/g)) {
    const unresolved = match[1].startsWith("@/") ? match[1].slice(2) : path.resolve(path.dirname(file), match[1]);
    const candidates = [unresolved, `${unresolved}.ts`, `${unresolved}.tsx`, `${unresolved}.mjs`, path.join(unresolved, "index.ts"), path.join(unresolved, "index.tsx")];
    if (!candidates.some(existsSync)) missingImports.push(`${file} -> ${match[1]}`);
  }
}
if (missingImports.length) throw new Error(`Missing local imports:\n${missingImports.join("\n")}`);

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
if (pkg.version !== lock.version || pkg.version !== lock.packages[""].version) throw new Error("Package versions do not agree");
for (const [name, version] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (lock.packages[""].dependencies?.[name] !== version && lock.packages[""].devDependencies?.[name] !== version) throw new Error(`Lockfile mismatch: ${name}`);
}

const schema = readFileSync("prisma/schema.prisma", "utf8");
const migration = readFileSync("prisma/migrations/20260618000000_production_baseline/migration.sql", "utf8");
const models = [...schema.matchAll(/^model\s+(\w+)\s+\{/gm)].map((match) => match[1]);
const missingTables = models.filter((model) => !migration.includes(`CREATE TABLE "${model}"`));
if (missingTables.length) throw new Error(`Migration tables missing: ${missingTables.join(", ")}`);

const deploymentText = ["package-lock.json", "package.json", "prisma/schema.prisma", ...files].map((file) => readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["internal.api.openai.org", 'provider = "sqlite"', "@/lib/data"]) {
  if (deploymentText.includes(forbidden)) throw new Error(`Forbidden deployment remnant: ${forbidden}`);
}

console.log(`Package audit passed: ${files.length} source files, ${models.length} migrated models, portable lockfile and complete local imports.`);
