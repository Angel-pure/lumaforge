import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  workspaceId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  body: z.string().max(30_000),
  channel: z.enum(["LINKEDIN", "INSTAGRAM", "EMAIL", "BLOG", "X"]),
});

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
  const membership = await prisma.membership.findUnique({ where: { userId_workspaceId: { userId: user.id, workspaceId } } });
  if (!membership) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const items = await prisma.content.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: { id: true, title: true, body: true, channel: true, status: true, updatedAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid content details" }, { status: 400 });
  const membership = await prisma.membership.findUnique({ where: { userId_workspaceId: { userId: user.id, workspaceId: parsed.data.workspaceId } } });
  if (!membership) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const { workspaceId, ...data } = parsed.data;
  const item = await prisma.content.create({
    data: { ...data, workspaceId, userId: user.id, versions: { create: { body: data.body } } },
    select: { id: true, title: true, body: true, channel: true, status: true, createdAt: true },
  });
  return NextResponse.json({ item }, { status: 201 });
}
