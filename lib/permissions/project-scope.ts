import type { Prisma } from "@prisma/client";
import type { SessionUser } from "@/lib/auth/session";

export function projectScope(user: SessionUser): Prisma.ProjectWhereInput {
  return user.role === "Admin" || user.role === "Director" ? {} : { members: { some: { userId: user.id } } };
}
