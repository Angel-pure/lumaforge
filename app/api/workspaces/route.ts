import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { workspace: { select: { id: true, name: true, plan: true } } },
    orderBy: { workspace: { createdAt: "asc" } },
  });
  return NextResponse.json({ workspaces: memberships.map(({ workspace }) => workspace) });
}
