# LumaForge

Create clearly. Publish confidently.

## Current implementation

This branch is the production foundation for an on-brand content workspace.

- Next.js 14 App Router and TypeScript
- Responsive Command Center UI
- PostgreSQL schema with Prisma
- Plan-level generation limits
- Zod validation for Studio requests
- Health check at `/api/health`
- Generation API seam at `/api/generations`
- Vercel deployment configuration

## Local setup

Requirements: Node.js 20+, PostgreSQL 14+.

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run typecheck
npm run build
```

## Production completion roadmap

1. Add authentication and workspace onboarding.
2. Add Prisma migrations and seed data.
3. Connect the server-side AI provider adapter and usage metering.
4. Add content library, versions, review workflow, and audit events.
5. Add Stripe subscriptions, billing portal, invoices, refunds, and verified webhooks.
6. Add an India payment adapter for UPI and domestic payment flows.
7. Add publishing integrations, rate limits, security headers, observability, and end-to-end tests.

Never commit real secrets. Configure them in Vercel project environment variables.
