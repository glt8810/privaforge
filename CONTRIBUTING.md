# Contributing to PrivaForge

## Branch strategy

- `main` is always deployable. Every merge is a candidate release.
- Feature branches: `<type>/<scope>-<short-desc>`, e.g. `feat/vault-share-flow`.
- One logical change per PR. Smaller PRs merge faster and audit better.

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/). `commitlint`
enforces them in CI and on local commit via the husky hook.

```
<type>(<scope>): <short imperative summary>

[optional body]

[optional footer(s)]
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`, `security`.

## Pre-commit pipeline

- Prettier runs on staged files via `lint-staged`.
- Commit message is linted via `commitlint`.
- Never skip hooks (`--no-verify`). If a hook fails, fix the underlying issue.

## PR requirements

- CI green (lint, typecheck, test, build, CodeQL, gitleaks).
- At least one review from a CODEOWNER of every touched path.
- Crypto changes: security-reviewer approval is mandatory (branch protection).
- The PR template checklist is filled in (security section is not optional).

## Code style

- TypeScript strict mode. No `any` without an adjacent `// @ts-expect-error` + justification.
- Prefer `Result<T, E>` / typed errors over throwing `Error` for expected failure paths.
- No unused exports. No dead code.
- No comments that describe *what* the code does — good names cover that. Comments are for *why*, for invariants, and for references to ADRs/RFCs.
- Never log secrets, plaintext, or keys. `console.log` is banned in `packages/encryption`.

## Adding a dependency

Every new dependency is a supply-chain risk. Before adding one, check:

- Weekly download count > 10k (sanity floor).
- Last publish within 6 months.
- At least one maintainer with a verified npm account and history.
- License is MIT / Apache-2.0 / BSD. GPL requires legal review.
- Bundle impact: run `pnpm why <pkg>` before and after.

Prefer to use the stdlib, Web APIs, or write a 20-line helper over pulling in a
trivial wrapper package.

## Working with AI agents

This project is built by AI-augmented developers (see plan §15). Expectations:

1. **Every AI-generated PR gets a human review.** No exceptions.
2. **Crypto and payment code get two human reviews**, one of which is a security reviewer.
3. Agents should cite the ADRs and the plan in their PR descriptions — explicit traceability is how we keep the architecture coherent across many contributors.
4. Tests are not optional. If an agent ships code without tests, close the PR.

## Local setup

```bash
pnpm install        # installs all workspaces
pnpm dev            # starts apps/web
pnpm test --watch   # run tests in watch mode
pnpm --filter @privaforge/encryption test   # just the encryption package
```

## Questions

Open a `[question]` issue or ping `#privaforge-eng` in the team chat. For
security issues, see [SECURITY.md](SECURITY.md) — do **not** use public issues.
