"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUser, requireInternalUser } from "@/lib/auth/session";
import { createProject } from "@/server/services/project-service";

export async function createProjectAction(input: unknown) {
  const user = await requireCurrentUser();
  requireInternalUser(user);
  return createProject(input, user);
}

export async function createProjectFormAction(formData: FormData) {
  const project = await createProjectAction({
    clientId: formData.get("clientId"),
    name: formData.get("name"),
    sector: formData.get("sector"),
    projectManagerId: formData.get("projectManagerId"),
    status: formData.get("status") || "ENQUIRY",
    health: formData.get("health") || "AMBER",
    stageTemplateId: formData.get("stageTemplateId") || undefined
  });
  revalidatePath("/platform/projects");
  redirect(`/platform/projects/${project.id}`);
}
