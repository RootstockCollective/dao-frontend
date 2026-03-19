# Devlog: DAO-2109 — Phases 1–3

**Date:** 2025-03-19  
**Phase:** 1–3 (mapper + hook + UI)  
**Developer:** Developer Agent  

---

## What Was Planned

- Phase 1: `NO_VAULT_SHARES_REASON`, extend `toActionEligibility` with `hasVaultShares`, mapper tests.
- Phase 2: Add `balanceOf` to `useActionEligibility` multicall; hook tests.
- Phase 3: Disable both actions while any deposit/withdraw tx is submitting; component tests.

## What Was Done

- **`services/constants.ts`:** `NOT_WHITELISTED_REASON` → `Address not whitelisted.`; added `NO_VAULT_SHARES_REASON`, `REQUEST_SUBMITTING_REASON`.
- **`services/ui/mappers.ts`:** `toActionEligibility` now takes `hasVaultShares`; withdraw gated on whitelist + shares + pause + no active request; withdraw reason priority per plan.
- **`hooks/useActionEligibility/useActionEligibility.ts`:** 6th multicall read `balanceOf(user)`; `hasVaultShares` derived fail-closed from slot result.
- **`components/BtcVaultActions.tsx`:** `isAnySubmitting` disables both buttons; tooltips use `REQUEST_SUBMITTING_REASON` while submitting.
- **Tests:** `mappers.test.ts`, `useActionEligibility.test.ts` updated; added `BtcVaultActions.test.tsx` (QueryClient + mocked hooks).

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Inline `withdrawBlockReason` in mapper vs helper | YAGNI | None |
| No persistent inline “not whitelisted” banner | Tooltips + story alignment with existing pattern | None |

## Discoveries

- Tooltip content may not be visible in DOM without hover; component tests assert **disabled** state only for submitting UX.

## Plan Amendments

Recorded in `.workflow/plans/DAO-2109-plan.md`.

## Notes for Code Review

- Multicall index order: slots 0–5 documented in `VaultMulticallData`; updating contract list requires updating tests’ `makeVaultResults`.
- Duplicate `balanceOf` with `useUserPosition` is accepted per plan (future cache dedup).
