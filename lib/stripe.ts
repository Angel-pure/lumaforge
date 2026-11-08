import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" })
  : null;

export function requireStripe() {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured");
  return stripe;
}
