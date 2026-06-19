import { projects } from "@/lib/demo-data";

export type ProjectHealth = "GREEN" | "AMBER" | "RED";

export type DemoProject = {
  id: string;
  name: string;
  client: string;
  sector: string;
  manager: string;
  stage: string;
  health: ProjectHealth;
  summary: string;
  status: string;
  fee: number;
  forecast: number;
  source: "seed" | "local";
};

export type NewDemoProject = Pick<DemoProject, "name" | "client" | "sector" | "manager" | "stage" | "health" | "summary">;

const STORAGE_KEY = "mep-demo-projects-v1";

export const seedDemoProjects: DemoProject[] = projects.map((project) => ({
  ...project,
  summary: `${project.sector} commission currently progressing through ${project.stage}.`,
  source: "seed"
}));

function isStoredProject(value: unknown): value is DemoProject {
  if (!value || typeof value !== "object") return false;
  const project = value as Partial<DemoProject>;
  return typeof project.id === "string" && typeof project.name === "string" &&
    typeof project.client === "string" && typeof project.sector === "string" &&
    typeof project.manager === "string" && typeof project.stage === "string" &&
    (project.health === "GREEN" || project.health === "AMBER" || project.health === "RED") &&
    typeof project.summary === "string";
}

export function getStoredProjects(): DemoProject[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isStoredProject) : [];
  } catch {
    return [];
  }
}

export function getAllDemoProjects(): DemoProject[] {
  const seedIds = new Set(seedDemoProjects.map((project) => project.id));
  return [...seedDemoProjects, ...getStoredProjects().filter((project) => !seedIds.has(project.id))];
}

export function getDemoProject(projectId: string): DemoProject | undefined {
  return getAllDemoProjects().find((project) => project.id === projectId);
}

export function createDemoProject(input: NewDemoProject): DemoProject {
  if (typeof window === "undefined") throw new Error("Projects can only be created in the browser.");
  const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project";
  const project: DemoProject = {
    ...input,
    id: `${slug}-${Date.now().toString(36)}`,
    status: "LIVE",
    fee: 0,
    forecast: 0,
    source: "local"
  };

  // Prototype only: browser localStorage is not production persistence and will be replaced by the enterprise data layer.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...getStoredProjects(), project]));
  window.dispatchEvent(new Event("demo-projects-updated"));
  return project;
}
