import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  body: z.string().max(30_000).optional(),
  status: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
}).refine((data) => Object.keys(data).length > 0);

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid update" }, { status: 400 });

  const existing = await prisma.content.findUnique({ where: { id: params.id }, select: { id: true, workspaceId: true, body: true } });
  if (!existing) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  const membership = await prisma.membership.findUnique({ where: { userId_workspaceId: { userId: user.id, workspaceId: existing.workspaceId } } });
  if (!membership) return NextResponse.json({ error: "Content not found" }, { status: 404 });

  const { body, ...fields } = parsed.data;
  const item = await prisma.$transaction(async (tx) => {
    if (body !== undefined && body !== existing.body) {
      await tx.contentVersion.create({ data: { contentId: existing.id, body } });
    }
    return tx.content.update({ where: { id: existing.id }, data: { ...fields, ...(body !== undefined ? { body } : {}) } });
  });
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const existing = await prisma.content.findUnique({ where: { id: params.id }, select: { id: true, workspaceId: true } });
  if (!existing) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  const membership = await prisma.membership.findUnique({ where: { userId_workspaceId: { userId: user.id, workspaceId: existing.workspaceId } } });
  if (!membership) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  await prisma.content.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
