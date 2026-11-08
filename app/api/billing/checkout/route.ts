import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireStripe } from "@/lib/stripe";

const schema = z.object({ plan: z.enum(["CREATOR", "TEAM"]) });
const priceForPlan = { CREATOR: "STRIPE_CREATOR_PRICE_ID", TEAM: "STRIPE_TEAM_PRICE_ID" } as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Select a valid plan" }, { status: 400 });

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
    include: { workspace: true },
    orderBy: { workspace: { createdAt: "asc" } },
  });
  if (!membership) return NextResponse.json({ error: "Workspace owner membership required" }, { status: 403 });

  const priceId = process.env[priceForPlan[parsed.data.plan]];
  if (!priceId || !process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: "Billing configuration is incomplete" }, { status: 503 });
  }

  try {
    const session = await requireStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: membership.workspaceId,
      metadata: { workspaceId: membership.workspaceId, userId: user.id, plan: parsed.data.plan },
      subscription_data: { metadata: { workspaceId: membership.workspaceId, userId: user.id, plan: parsed.data.plan } },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 502 });
  }
}
