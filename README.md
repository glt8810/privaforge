# PrivaForge AI

Privacy-first, zero-knowledge AI prompt engineering & management platform.

**Status:** Phase 0 scaffold. Not production-ready. Crypto audit pending.

## What this is

A monorepo implementing the [PrivaForge AI Implementation Plan](docs/implementation-plan.md) (see source `.docx`). The core thesis:

> Your prompts. Your keys. Your control. The platform operator literally cannot read your content.

## Repository layout

```
privaforge/
├── apps/
│   └── web/                 # Next.js 15 App Router — public site + dashboard
├── packages/
│   ├── encryption/          # 🔒 E2EE primitives (Argon2id + HKDF + AES-256-GCM)
│   ├── api-types/           # Shared Zod schemas (client ↔ server contract)
│   └── db/                  # Drizzle schema + Neon client + migrations
├── docs/
│   └── adr/                 # Architecture Decision Records
├── .github/                 # CI, CodeQL, gitleaks, Dependabot, CODEOWNERS
└── ... (root config)
```

## Getting started

**Prereqs:** Node 22, pnpm 9, a Postgres URL (Neon free tier works).

```bash
# 1. Install
pnpm install

# 2. Configure env
cp .env.example .env.local
# ...fill in DATABASE_URL and Clerk/Stripe/Sentry keys as you wire them up

# 3. Run checks
pnpm lint
pnpm typecheck
pnpm test

# 4. Dev server
pnpm dev        # → http://localhost:3000
```

## Phased roadmap (from the implementation plan)

| Phase | Weeks | Scope | Status |
|-------|-------|-------|--------|
| Phase 0 | Pre-kickoff | Monorepo, ADRs, CI, security gates | ✅ this commit |
| Phase 1 | 1–3 | Auth + E2EE vault + version history + optimizer MVP | 🚧 next |
| Phase 2 | 4–6 | Marketplace + Stripe Connect + collab basics | ⏳ |
| Phase 3 | 7–9 | Pentest, hardening, launch prep | ⏳ |

## Key design docs

- [ADR-0001: Tech Stack](docs/adr/0001-tech-stack.md) — the "why" behind every dependency.
- [ADR-0002: Crypto Design](docs/adr/0002-crypto-design.md) — primitives, parameters, audit gate.
- [SECURITY.md](SECURITY.md) — threat model, responsible disclosure, data handling invariants.
- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, commit conventions, security review rules.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run Next.js dev server (Turbopack) |
| `pnpm build` | Build every workspace, cached by Turborepo |
| `pnpm test` | Run Vitest across every package |
| `pnpm typecheck` | Strict TS check across every package |
| `pnpm lint` | ESLint flat config, max-warnings=0 |
| `pnpm format` | Prettier write |
| `pnpm --filter @privaforge/db db:generate` | Generate a Drizzle migration from schema changes |
| `pnpm --filter @privaforge/db db:migrate` | Apply pending migrations |

## Non-goals (for the MVP)

- Real-time CRDT collaboration (v1.1)
- Private RAG over documents (v1.2)
- Self-hostable distribution (v2.0)
- Mobile apps (v2.0)

## License

UNLICENSED / proprietary until the open-source client strategy (plan §5.3) is finalised.
