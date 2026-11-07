import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 400 });

  const payload = await request.text();
  try {
    const event = requireStripe().webhooks.constructEvent(payload, signature, secret);
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "invoice.payment_failed":
        console.info("Stripe billing event received", event.type, event.id);
        break;
      default:
        console.info("Stripe event ignored", event.type);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook verification failed", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
