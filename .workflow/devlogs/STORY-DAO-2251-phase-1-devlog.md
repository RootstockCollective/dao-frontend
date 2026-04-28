# Devlog: STORY-DAO-2251 — Phase 1

**Date:** 2026-04-15  
**Phase:** 1 of 1  
**Developer:** Developer Agent

---

## What Was Planned

- Add `get-btc-vault-action-eligibility-contracts.ts` and wire `useActionEligibility` to it.
- Fix `useBtcVaultInvalidation`: `active-requests-history` key, drop bogus `action-eligibility` key, invalidate wagmi `readContracts` via `readContractsQueryKey` and shared contracts; align `config` usage with `executeTxFlow` if needed.
- Compose parent `onAfterClaimRefetch` / `onAfterRedeemRefetch` with `useActionEligibility` refetch in `BtcVaultDashboard` (parent first, then eligibility).
- Update `useBtcVaultInvalidation.test.ts` and `BtcVaultDashboard.test.tsx`.

## What Was Done

- Added `src/app/btc-vault/hooks/get-btc-vault-action-eligibility-contracts.ts` exporting `getBtcVaultActionEligibilityContracts(address)`.
- `useActionEligibility` now builds the multicall from that helper.
- `useBtcVaultInvalidation` invalidates `['btc-vault', 'active-requests-history', address]`, skips the unused `action-eligibility` key, and invalidates `readContractsQueryKey({ contracts, chainId })` when `address` is set. Uses `useChainId()` from wagmi context (no `@/config` import in this hook).
- `BtcVaultDashboard` wraps claim/redeem callbacks with `useCallback` handlers that call the page callback then `void refetchActionEligibility()`.
- Tests: invalidation expectations updated; added case for missing `address`; dashboard tests trigger probe `onClick` and assert refetch ordering; claim/redeem probes always receive a refetch handler (`data-has-refetch` now `yes` without parent callback).

## Deviations from Plan


| Deviation                                                           | Reason                                                                                                                                                                     | Impact                                                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| No `import { config } from '@/config'` in `useBtcVaultInvalidation` | Importing `@/config` in the invalidation hook pulled full wagmi config through `ledgerConnector` and broke `useBtcVaultInvalidation.test.ts` (partial `vi.mock('wagmi')`). | `useChainId()` without arguments uses the Wagmi provider config, matching runtime behavior. |


## Discoveries

- `@wagmi/core/query` `readContractsQueryKey` takes a single options object (contracts + `chainId`), not `(config, options)` as sometimes assumed in prose plans.

## Plan Amendments

Recorded in `STORY-DAO-2251-plan.md` **Plan Amendments** table.

## Notes for Code Review

- Confirm `useChainId()` matches the chain id embedded in `useReadContracts` query keys for the eligibility multicall in all environments (single-chain app config should align).
- Sequential refetch: parent `refetchActiveRequests` (or other page callback) runs before eligibility refetch; both are fire-and-forget after the parent sync portion.

