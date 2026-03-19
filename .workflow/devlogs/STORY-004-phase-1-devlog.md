# Devlog: STORY-004 — Phase 1

**Date:** 2025-03-19
**Phase:** 1 of 4
**Developer:** Developer Agent

---

## What Was Planned

Phase 1 (KYB types and mock hook, data layer):

- Create `src/app/btc-vault/types/kyb.ts` with `KybStatus` and `KybStatusResult`.
- Create `src/app/btc-vault/hooks/useKybStatus/useKybStatus.ts`: mock hook that reads query param `kyb` via `useSearchParams()`; if valid (`none`|`rejected`|`passed`), return that status; else default `'none'`. Return `KybStatusResult`; when status is `'rejected'` include optional `rejectionReason` (mock string).
- Create `src/app/btc-vault/hooks/useKybStatus/useKybStatus.test.ts`: unit tests for correct status for `?kyb=none`, `?kyb=rejected`, `?kyb=passed`; default when param missing or invalid.

---

## What Was Done

- **types/kyb.ts:** Added `KybStatus = 'none' | 'rejected' | 'passed'` and `KybStatusResult { status, rejectionReason? }` with JSDoc.
- **useKybStatus.ts:** Implemented mock hook: `useSearchParams()` from `next/navigation`, `parseKybParam()` for valid values (case-insensitive), default `'none'` when missing or invalid. When `status === 'rejected'`, set `rejectionReason` to a fixed mock string. Explicit return type `KybStatusResult`. JSDoc describes mock vs future API swap.
- **useKybStatus.test.ts:** Mocked `next/navigation` `useSearchParams` to return an object with `get('kyb')`. Six tests: missing param → `none`; invalid param → `none`; `?kyb=none` → `none`; `?kyb=rejected` → `rejected` + defined non-empty `rejectionReason`; `?kyb=passed` → `passed`; case-insensitive (e.g. `PASSED` → `passed`).

---

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| (none) | — | — |

---

## Discoveries

- Existing btc-vault hooks follow `hooks/useXxx/useXxx.ts` + co-located `useXxx.test.ts`; no `index.ts` was added for useKybStatus (plan did not require it; other hooks like useEpochState also have no index).
- `next/navigation` is mocked in tests by providing a function that returns `{ get: (name) => ... }`; only `kyb` is used by the hook.

---

## Plan Amendments

None. The `## Plan Amendments` table in the plan file was not updated.

---

## Notes for Code Review

- Hook is client-only (`'use client'`) because it uses `useSearchParams()`.
- `rejectionReason` is only set when status is `'rejected'`; the plan allowed "optional rejectionReason (mock string)" and a single constant is used for all rejected cases.
- Param parsing is case-insensitive and trims whitespace; tests cover `PASSED` → `passed`.
- No barrel export (`index.ts`) for the hook; consumers can import from `./hooks/useKybStatus/useKybStatus` (same pattern as useEpochState in BtcVaultBanners).
