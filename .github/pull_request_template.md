# Summary

<!-- 1–3 sentences on what this PR does and why. -->

## Changes

- <!-- bullet list -->

## Security checklist

- [ ] No plaintext user data reaches the server unencrypted.
- [ ] No secrets committed (`.env*` in gitignore; gitleaks CI green).
- [ ] New DB columns holding user content are `bytea` envelopes or fixed-length hashes.
- [ ] Any new third-party dependency is pinned and has been vetted on npm (popularity, maintainer history, last publish).
- [ ] If this touches `packages/encryption`, ADR-0002 was consulted and, if changing primitives, a follow-up ADR is opened.

## Test plan

- [ ] Unit tests added / updated.
- [ ] `pnpm test` passes locally.
- [ ] Manually exercised the affected flows.

## Screenshots / recordings (UI changes)

<!-- paste here or N/A -->
