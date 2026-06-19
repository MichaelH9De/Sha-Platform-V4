import { redirect } from "next/navigation";
import { getSessionIdentity } from "@/lib/auth/entra";
import { prisma } from "@/lib/db/client";
import { isRoleName, RoleName } from "@/lib/permissions/policy";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: RoleName;
  projectIds: string[];
  disciplineIds: string[];
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const identity = await getSessionIdentity();
  if (!identity) return null;
  const user = await prisma.user.findFirst({ where: { email: identity.email, status: "ACTIVE" }, include: { role: true, projectMemberships: { select: { projectId: true, disciplineId: true } } } });
  if (!user || !isRoleName(user.role.name)) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.name,
    projectIds: user.projectMemberships.map((membership) => membership.projectId),
    disciplineIds: user.projectMemberships.flatMap((membership) => membership.disciplineId ? [membership.disciplineId] : [])
  };
}

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export function requireInternalUser(user: SessionUser) {
  if (user.role === "Client/External") {
    throw new Error("External users cannot access this internal workflow.");
  }
}
