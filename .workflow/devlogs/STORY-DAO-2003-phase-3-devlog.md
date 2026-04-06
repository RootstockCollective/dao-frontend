# Devlog: STORY-DAO-2003 — Phase 3

**Date:** 2026-04-06  
**Phase:** 3 (Regression tests — like / SIWE / JWT)  
**Developer:** Developer Agent  

---

## What Was Planned

- Co-located `useLike.test.ts`: mock `siweStore` (Zustand), global `fetch`, `showToast`; cover expired JWT + deferred `signIn`, valid JWT, disabled `/api/like/user` query when JWT expired, `signIn` → `null`, POST `401` → `signOut` + toast.
- Extend `LikeButton.test.tsx`: integration-style case — connected wallet, not SIWE-authenticated → click calls `signIn`.
- Optional: `LikeButton` 401 + toast — covered at hook level in `useLike.test.ts` instead to avoid duplicate heavy mocks.

## What Was Done

- Added `src/app/proposals/[id]/hooks/useLike.test.ts` with five Vitest + RTL `renderHook` cases and minimal base64url JWT helpers aligned with `jose` / `isTokenExpired`.
- Refactored `LikeButton.test.tsx`: removed stub `useLike` mock (toggling stub vs real implementation breaks Rules of Hooks under React Strict Mode). All `LikeButton` tests now use the real `useLike` with a shared `installLikeApiFetchMock()`, Zustand `siweStore` mock, and `afterEach(cleanup())` to avoid duplicate nodes in `document.body`. SIWE integration test waits for the public like count before clicking so `handleClick` is not blocked by `isBusy`.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| No conditional `useLike` stub in `LikeButton.test.tsx` | Stub returns no internal hooks; real `useLike` uses many hooks — switching caused hook-order errors and duplicate DOM when cleanup failed. | Slightly heavier `LikeButton` tests; behavior closer to production. |
| `STORY-DAO-2003-plan.md` not updated | File is absent in this worktree (`.workflow/plans/` has no story plan). | Amendments recorded here only; orchestrator can merge into canonical plan in main repo. |

## Discoveries

- `npm run build` without a full env profile still fails during “Collecting page data” (first run: `currentEnvChain` / challenge route; with `NEXT_PUBLIC_ENV=mainnet`: `Chain not configured` on `/api/btc-vault/metrics`). Not introduced by Phase 3. `npm run lint`, `npm run lint-tsc`, and `npm run test` all pass.

## Notes for Code Review / QA

- Expired-JWT test gates `signIn` with a pending promise and asserts no `/api/like/user` call used `Authorization: Bearer <expired>` before release.
- For PR: confirm CI has the same `.env` / `NEXT_PUBLIC_*` expectations as local full builds if build is a required check.
