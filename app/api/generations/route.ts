import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";
import { generationRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";

function monthKey() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const parsed = generationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid generation request" }, { status: 400 });

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: parsed.data.workspaceId } },
    include: { workspace: true },
  });
  if (!membership) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Generation is not configured" }, { status: 503 });

  const period = monthKey();
  const limit = PLAN_LIMITS[membership.workspace.plan].generations;
  try {
    await prisma.$transaction(async (tx) => {
      const usage = await tx.usageRecord.upsert({
        where: { userId_workspaceId_period: { userId: user.id, workspaceId: membership.workspaceId, period } },
        create: { userId: user.id, workspaceId: membership.workspaceId, period, generations: 0 },
        update: {},
      });
      if (usage.generations >= limit) throw new Error("PLAN_LIMIT_REACHED");
      await tx.usageRecord.update({ where: { id: usage.id }, data: { generations: { increment: 1 } } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Error && error.message === "PLAN_LIMIT_REACHED") {
      return NextResponse.json({ error: "Monthly generation limit reached", plan: membership.workspace.plan, limit }, { status: 429 });
    }
    console.error("Unable to reserve generation usage", error);
    return NextResponse.json({ error: "Usage service temporarily unavailable" }, { status: 503 });
  }

  try {
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: `Write useful, original ${parsed.data.channel} content. Use a ${parsed.data.tone.toLowerCase()} tone. Return only the finished content, no commentary.` },
          { role: "user", content: parsed.data.prompt },
        ],
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!aiResponse.ok) throw new Error(`AI provider returned ${aiResponse.status}`);
    const result = await aiResponse.json();
    const body = result.choices?.[0]?.message?.content?.trim();
    if (!body || typeof body !== "string") throw new Error("AI provider returned an empty response");

    const title = parsed.data.prompt.slice(0, 80);
    const content = await prisma.content.create({
      data: {
        title,
        body,
        channel: parsed.data.channel,
        userId: user.id,
        workspaceId: membership.workspaceId,
        versions: { create: { body } },
      },
      select: { id: true, title: true, body: true, channel: true, status: true, createdAt: true },
    });
    return NextResponse.json({ content, usage: { period, limit } }, { status: 201 });
  } catch (error) {
    await prisma.usageRecord.updateMany({
      where: { userId: user.id, workspaceId: membership.workspaceId, period, generations: { gt: 0 } },
      data: { generations: { decrement: 1 } },
    }).catch((rollbackError) => console.error("Generation usage rollback failed", rollbackError));
    console.error("Content generation failed", error);
    return NextResponse.json({ error: "Content generation failed; usage was not charged" }, { status: 502 });
  }
}
