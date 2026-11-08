# LumaForge

Create clearly. Publish confidently.

LumaForge is a Next.js application foundation for creating and managing on-brand content. This branch includes signup/login, workspace membership, an AI-generation endpoint with plan quota reservation, saved content and revisions, and the initial Stripe checkout/webhook flow.

## Run locally

Requirements: Node.js 20 and PostgreSQL.

```bash
npm install
cp .env.example .env.local
# Set DATABASE_URL and AUTH_SECRET (at least 32 random characters)
npm run db:generate
npm run db:migrate
npm run dev
```

Open http://localhost:3000. Create an account at `/signup`. The Studio uses the first workspace returned for your account.

## Verification

```bash
npm run typecheck
npm run build
```

A GitHub Actions workflow is intended to run install, Prisma client generation, type checking, and build verification. Check the Actions tab for actual results; a committed workflow alone is not a passing build.

## Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `AUTH_SECRET`: random secret with at least 32 characters.
- `OPENAI_API_KEY`: server-only AI provider key; generation returns 503 if missing.
- `OPENAI_MODEL`: optional model name (defaults to `gpt-4o-mini`).
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe test/live credentials.
- `STRIPE_CREATOR_PRICE_ID`, `STRIPE_TEAM_PRICE_ID`: recurring Price IDs in the same Stripe mode.
- `NEXT_PUBLIC_APP_URL`: canonical application URL.

Never commit real secrets. Configure production values in Vercel environment settings. Use Stripe test mode until end-to-end billing tests pass.

## Database deployment

Generate and review migrations in a development database. Commit `prisma/migrations/`; deploy them to a production database with:

```bash
npm run db:migrate:deploy
```

Back up production before schema migrations. `db:push` is intentionally not provided as a production command.

## Important launch limitations

This repository is not certified production-ready. Before charging real users, complete and verify:

- Email verification, account recovery, MFA policy, abuse protection, and rate limits.
- CSRF/origin checks for cookie-authenticated state-changing routes.
- Race-safe usage reservations, provider error handling, retry and billing edge cases.
- Stripe webhook replay/concurrency tests, plan downgrades, cancellation and failed-payment handling.
- Tests, staging deployment, backups and restore drill, monitoring, alerting, and security review.
- Published legal, privacy, refund, tax, and support information for the operating business.

The current app has not been built or type-checked in this environment. Do not enable live payments until CI passes and a staging acceptance test succeeds.
