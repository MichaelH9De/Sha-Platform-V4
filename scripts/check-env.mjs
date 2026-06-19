const demoMode = process.env.DEMO_MODE === "true" || process.env.DEMO_AUTH_ENABLED === "true";
if (demoMode) {
  console.log("Demo deployment environment validated. Enterprise database and Entra variables are intentionally optional.");
  process.exit(0);
}

const required = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "AUTH_MICROSOFT_ENTRA_ID_ID",
  "AUTH_MICROSOFT_ENTRA_ID_SECRET",
  "AUTH_MICROSOFT_ENTRA_ID_ISSUER",
  "WEBHOOK_SECRET"
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing deployment environment variables: ${missing.join(", ")}`);
  process.exit(1);
}
if (!process.env.DATABASE_URL.startsWith("postgresql://") && !process.env.DATABASE_URL.startsWith("postgres://")) {
  console.error("DATABASE_URL must be a PostgreSQL connection string.");
  process.exit(1);
}
for (const name of ["AUTH_SECRET", "WEBHOOK_SECRET"]) {
  if (Buffer.byteLength(process.env[name]) < 32) {
    console.error(`${name} must contain at least 32 bytes.`);
    process.exit(1);
  }
}
if (!process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER.startsWith("https://login.microsoftonline.com/")) {
  console.error("AUTH_MICROSOFT_ENTRA_ID_ISSUER must use the Microsoft login host.");
  process.exit(1);
}
console.log("Deployment environment validated.");
