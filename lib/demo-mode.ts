export function isDemoMode() {
  return process.env.DEMO_MODE === "true" || process.env.DEMO_AUTH_ENABLED === "true";
}
