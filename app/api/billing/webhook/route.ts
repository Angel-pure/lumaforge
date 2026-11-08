import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireStripe } from "@/lib/stripe";

export const runtime = "nodejs";

async function saveSubscription(subscription: Stripe.Subscription) {
  const workspaceId = subscription.metadata.workspaceId;
  const userId = subscription.metadata.userId;
  const plan = subscription.metadata.plan;
  if (!workspaceId || !userId || !["CREATOR", "TEAM"].includes(plan)) {
    throw new Error("Subscription metadata is incomplete");
  }

  const planValue = plan as "CREATOR" | "TEAM";
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const periodEnd = subscription.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { providerSubscriptionId: subscription.id },
      create: {
        provider: "STRIPE",
        providerCustomerId: customerId,
        providerSubscriptionId: subscription.id,
        status: subscription.status,
        plan: planValue,
        currentPeriodEnd,
        workspaceId,
        userId,
      },
      update: { status: subscription.status, plan: planValue, currentPeriodEnd, providerCustomerId: customerId },
    });
    if (["active", "trialing", "past_due"].includes(subscription.status)) {
      await tx.workspace.update({ where: { id: workspaceId }, data: { plan: planValue } });
    } else if (["canceled", "unpaid", "incomplete_expired"].includes(subscription.status)) {
      await tx.workspace.update({ where: { id: workspaceId }, data: { plan: "FREE" } });
    }
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = requireStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error("Stripe webhook verification failed", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  try {
    const prior = await prisma.webhookEvent.findUnique({ where: { provider_externalId: { provider: "STRIPE", externalId: event.id } } });
    if (prior?.processedAt) return NextResponse.json({ received: true, duplicate: true });
    const record = prior ?? await prisma.webhookEvent.create({
      data: { provider: "STRIPE", externalId: event.id, eventType: event.type },
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && typeof session.subscription === "string") {
          const subscription = await requireStripe().subscriptions.retrieve(session.subscription);
          await saveSubscription(subscription);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await saveSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (typeof invoice.subscription === "string") {
          await prisma.subscription.updateMany({ where: { providerSubscriptionId: invoice.subscription }, data: { status: "past_due" } });
        }
        break;
      }
      default:
        break;
    }

    await prisma.webhookEvent.update({ where: { id: record.id }, data: { processedAt: new Date() } });
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", event.id, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
