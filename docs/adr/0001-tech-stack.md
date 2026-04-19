# ADR-0001: Tech Stack & Tooling Decisions

**Status:** Accepted
**Date:** 2026-04-19
**Deciders:** Tech Lead (Claude)

## Context

PrivaForge AI is a zero-knowledge, E2EE prompt management SaaS. The implementation plan
specifies an 8–10 week delivery with a 4–6 person AI-augmented team. This ADR records
the binding engineering decisions that unblock all downstream work.

## Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Package manager | **pnpm 9** | Strict hoisting prevents phantom deps (critical for crypto boundary), fast, disk-efficient. |
| Monorepo | **Turborepo + pnpm workspaces** | Incremental caching, well-supported by Vercel, zero-config for Next.js. |
| Runtime | **Node.js 22 LTS** | Active LTS through 2027; native `--test` runner, fetch, WebCrypto globally. |
| Language | **TypeScript 5.6 strict** | `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` enabled everywhere. Crypto bugs caught at compile time. |
| Framework | **Next.js 15 (App Router)** | Plan requirement. Server Components, edge runtime, first-class Vercel deploy. |
| UI | **Tailwind CSS v4 + shadcn/ui (Radix)** | Plan requirement. Headless, accessible, owned components (not a library dep). |
| State | **Zustand + TanStack Query** | Plan requirement. Zustand for local UI state, TanStack for server-cache. |
| DB | **Neon Postgres** | Plan requirement. Serverless, branching, PITR. |
| ORM | **Drizzle** (chosen over Prisma) | SQL-first matches plan's Appendix B. Better TS inference. Edge-compatible (Prisma needs engine proxy). Smaller bundle. |
| Auth | **Clerk** | Plan requirement. Passkeys, MFA, orgs out of the box. Custom key-derivation layer sits on top. |
| Payments | **Stripe + Stripe Connect** | Plan requirement. |
| Validation | **Zod 3** | De facto standard, infers types, runtime-safe boundary validation. |
| Crypto — KDF | **libsodium-wrappers (Argon2id)** | Audited WASM. Web Crypto API lacks Argon2. Plan-specified parameters (128MB memory, 3 iterations). |
| Crypto — AEAD | **Web Crypto API AES-256-GCM** | Native, constant-time, hardware-accelerated. No third-party risk. |
| Crypto — KDF (secondary) | **Web Crypto API HKDF-SHA-256** | For per-vault subkey derivation from master key. |
| Env vars | **@t3-oss/env-nextjs** | Typed, validated at boot. Fails fast in dev and CI. |
| Testing | **Vitest + fast-check + Playwright** | Vitest: native TS/ESM, faster than Jest. fast-check: property-based tests for crypto roundtrips. Playwright: E2E. |
| Linting | **ESLint 9 flat config + Prettier 3** | Next.js first-class support; stable, no surprises. |
| Commit hooks | **husky + lint-staged + commitlint (conventional)** | Enforces formatting and commit message hygiene pre-push. |
| CI | **GitHub Actions** | Plan requirement. Matrix on Node, parallel jobs. |
| Security scanning | **CodeQL + Dependabot + gitleaks** | Triple coverage: code, deps, secrets. Pre-merge blocking. |
| Observability | **Sentry + PostHog (self-host)** | Plan requirement. Configured with PII scrubbing and no prompt-content capture. |

## Consequences

**Positive**
- Every choice is mainstream and well-documented, reducing onboarding time for new devs/agents.
- Strict TS + pnpm hoisting + Turborepo caching + property-based crypto tests raises the floor on correctness.
- Drizzle keeps schema in SQL-first form, matching the plan's Appendix B and the third-party crypto auditor's likely preference for readable DDL.

**Negative / Tradeoffs**
- Drizzle is younger than Prisma; team members unfamiliar with it will need a short ramp. Mitigation: schema lives in one file, migrations are plain SQL.
- libsodium-wrappers adds ~200KB to the client bundle (WASM). Mitigation: lazy-loaded only during auth/key-derivation flows.
- Clerk is a vendor lock-in for auth. Mitigation: auth calls are abstracted behind `@privaforge/auth` package so a swap (Supabase Auth, Lucia) is a one-week job.

## Non-Decisions (deferred)

- **Vercel vs self-hosted (Fly.io)**: ship on Vercel for launch; revisit when enterprise on-prem (v2.0) ships.
- **Real-time collab (CRDT)**: v1.1 concern — Yjs over E2EE-wrapped updates is the likely pick.
- **Browser extension**: post-MVP.
