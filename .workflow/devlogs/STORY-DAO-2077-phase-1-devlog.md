# Devlog: STORY-DAO-2077 — Phase 1

**Date:** 2026-04-03  
**Phase:** 1 of 2  
**Developer:** Developer Agent

---

## What Was Planned

- Parent breadcrumb `<Link>` segments: `text-warm-gray` → `text-primary`; keep `breadcrumb-current` span unchanged.
- Decide delimiter `/` color; document if not obvious.

## What Was Done

- Updated `src/components/Breadcrumbs/Breadcrumbs.tsx`: parent links use `text-sm text-primary hover:underline`.
- Delimiters: `text-primary` for `/` between parent segments; `text-warm-gray` for the slash immediately before the current segment (neutral bridge to `text-text-100`).
- **`next build` TypeScript step** reported implicit `any` in `src/app/api/like/route.ts` (`$transaction` callback) and `src/app/api/like/user/route.ts` (`map` row). Added explicit typing so production build completes.
- **`src/lib/viemPublicClient.ts`:** `config.getClient` now uses `currentEnvChain.id` instead of `NEXT_PUBLIC_CHAIN_ID || 31`, matching the single chain in `createConfig` and avoiding an undefined client when public chain id disagrees with `ENV`.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| API + viem changes in Phase 1 | Required for `npm run build` / stable config in this branch | Small non-UI diff; see commit body |

## Discoveries

- `tsc --noEmit` (`npm run lint-tsc`) did not flag the like-route `tx` parameter; **Next.js build** TypeScript pass did — keep using the full build gate.
- **Build / prerender** needs a full app env (e.g. `set -a && . ./.env.testnet && set +a` before `npm run build`) when `NEXT_PUBLIC_*` is otherwise incomplete; otherwise static generation fails on pages/API routes.
- `npm run test` occasionally hit **timeouts** in unrelated suites under heavy parallel load; a clean rerun passed (1156 tests).

## Plan Amendments

- See `.workflow/plans/STORY-DAO-2077-plan.md` — `## Plan Amendments`.

## Notes for Code Review

- Confirm delimiter treatment (orange between parents, neutral slash before current) matches design intent.
- Optional: decide whether API/Prisma/viem fixes belong in this PR or a separate chore (they unblock `next build` here).
