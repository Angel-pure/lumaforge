import { NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const { priceId, customerId, successUrl, cancelUrl } = await request.json().catch(() => ({}));
  if (!priceId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: "priceId, successUrl, and cancelUrl are required" }, { status: 400 });
  }

  try {
    const session = await requireStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customerId || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout creation failed", error);
    return NextResponse.json({ error: "Billing is not configured" }, { status: 503 });
  }
}
