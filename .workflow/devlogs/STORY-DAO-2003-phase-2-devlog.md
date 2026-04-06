# Devlog: STORY-DAO-2003 — Phase 2

**Date:** 2026-04-06  
**Phase:** 2 (Surface SIWE / auth errors on Like UI)  
**Developer:** Developer Agent  

---

## What Was Planned

- `LikeButton`: use `error` from `useSignIn`, pass into SIWE tooltip, `useEffect` + `showToast` with deduplication by message.
- `SiweTooltipContent`: optional `error` prop, short inline copy; button retriggers sign-in.
- Optionally `useLike`: on POST `401`, `signOut()` + toast for server/client skew.
- Co-located `LikeButton.test.tsx`: mock `useSignIn` and `showToast`, assert toast and inline error.

## What Was Done

- `LikeButton.tsx`: `signInError` from `useSignIn`, ref-guarded `showToast` (`severity: 'error'`, title `Sign-in failed`, content = message), reset ref when error clears; passes `error` into `SiweTooltipContent`.
- `SiweTooltipContent.tsx`: optional `error`; `role="alert"` paragraph with `line-clamp-3` and `text-red-300`.
- `useLike.ts`: on failed POST with `response.status === 401`, `signOut()` + toast (`Session expired` / re-auth copy), then existing rollback.
- `LikeButton.test.tsx`: `TooltipProvider` + `QueryClientProvider` wrapper; tests for toast, no duplicate toast on re-render, toast again after clear + same message; `SiweTooltipContent` inline error test.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| (none) | — | — |

## Discoveries

- `npm run build` in this worktree failed during “Collecting page data” with `Cannot read properties of undefined (reading 'id')` traced to `currentEnvChain` when `ENV` does not match `envChains` (e.g. incomplete `.env`). Not caused by Phase 2 changes. `npm run lint`, `npm run lint-tsc`, and `npm run test` all passed.

## Notes for Code Review

- Toast dedupe keys on `error.message` only; two distinct errors with the same message would only toast once until error clears (acceptable trade-off per plan).
