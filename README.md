# LumaForge

Create clearly. Publish confidently.

LumaForge is a Next.js foundation for an on-brand content workspace. This branch contains the first commercial MVP slice: a responsive Command Center, initial plan-aware data model, and deployment-safe environment template.

## Local setup

Requirements: Node.js 20+, PostgreSQL 14+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run build
```

## Next implementation slices

1. Authentication and workspace onboarding.
2. Prisma client, migrations, and seed data.
3. Studio generation API with provider adapter, metering, and rate limits.
4. Content library, versions, review workflow, and audit events.
5. Stripe subscriptions, billing portal, invoices, refunds, and verified webhooks.
6. Razorpay adapter for India-specific payment methods.
7. Protected production deployment and observability.

No real payment or AI secrets belong in Git. Configure them in Vercel project environment variables.
