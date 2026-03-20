---
description: Git commit conventions
---

# Git Commits

- **Never** add `Co-authored-by` trailers to commits.
- **Always** use [Conventional Commits](https://www.conventionalcommits.org/) format:
  - `<type>(<optional scope>): <description>`
  - Common types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `ci`, `build`, `style`
  - Scope should describe the affected code area (e.g., `cache`, `api`, `vault`), not a ticket ID
  - Use lowercase for type and description start
  - Keep the subject line under 72 characters
  - Add a body separated by a blank line for additional context when needed
  - Examples:
    - `feat(cache): migrate unstable_cache to use cache directive`
    - `fix(api): handle null response in proposals route`
    - `refactor(layout): extract dynamic providers into Suspense boundary`

## Commit Sizing

Each commit should be a **single logical unit** that is easy to review, revert, and understand in `git blame` one year later.

- **One layer per commit:** data layer (types, mappers) OR UI component OR page integration. Do not mix layers.
- **Few files per commit:** target fewer than 5 source files changed (test files don't count). If a commit touches 8+ files, consider splitting.
- **Subject line = future blame context:** the message must answer "why does this code exist?" without reading the diff.
- **Body references story/phase** when working from a plan: include story ID and phase number in the body.
- Co-located test files are committed alongside their source — never in a separate "add tests" commit.

### Cross-cutting types (API ↔ UI)

When a ticket **renames or replaces a string enum** used by both `src/app/api/...` and feature UI, you usually cannot land “API only” first without breaking `tsc`. Prefer one of:

1. **Compatibility shim (data layer):** e.g. map API wire keys to the *previous* row/display enum in `mappers.ts` for one commit; remove the shim once `types.ts` and components use the new keys (each step green under `pre-commit`).
2. **Widen the type temporarily** (deprecated union members), then migrate UI and narrow — only when product accepts duplicate literals briefly.

If you still touch **more than five source files** in one commit, say so in the body (ticket ref + “single cross-component contract”) so `git blame` stays honest.
