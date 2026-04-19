# Changelog

All notable changes to this project will be documented in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added — Phase 0 scaffold (2026-04-19)

- Monorepo structure (pnpm workspaces + Turborepo).
- `@privaforge/encryption` — Argon2id + HKDF-SHA-256 + AES-256-GCM primitives with envelope format v1, AAD binding, property-based tamper-detection tests.
- `@privaforge/api-types` — Zod schemas for all client ↔ server API boundaries.
- `@privaforge/db` — Drizzle schema for users, vaults, prompts, prompt_versions, marketplace_listings, usage_logs. Neon serverless client.
- `@privaforge/web` — Next.js 15 App Router, Tailwind, strict CSP + security headers, typed env via `@t3-oss/env-nextjs`.
- CI: lint + typecheck + test + build matrix, CodeQL, gitleaks, pnpm audit, Dependabot grouped PRs.
- CODEOWNERS with mandatory security-reviewer approval on crypto paths.
- ADR-0001 (tech stack) and ADR-0002 (crypto design).
- SECURITY.md (threat model + pre-launch gates), CONTRIBUTING.md.

### Not yet done

- Argon2id param tuning against real-device benchmarks.
- Clerk integration + custom key-derivation UI.
- Prompt CRUD routes + React hooks.
- Marketplace + Stripe Connect.
- Penetration test / external crypto audit.
- Initial `pnpm install` to produce a lockfile (Node not installed on this machine).
