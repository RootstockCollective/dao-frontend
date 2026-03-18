# Devlog: STORY-002 — Phase 1

**Date:** 2025-03-18
**Phase:** 1 of 2
**Developer:** Developer Agent (handoff in dao-2066 worktree)

---

## What Was Planned

Phase 1: Replace useEpochState mock with on-chain reads (useReadContract for currentEpoch, useReadContracts for epochSnapshot, epochRedeemClaimable, openEpochPendingDepositAssets, epochTotalRedeemShares, and when epochId > 0 epochSnapshot(epochId - 1)). Derive status (open | settling | claimable), navPerShare, startTime, endTime; build EpochState; pass to toEpochDisplay(); remove MOCK_EPOCH. Add EPOCH_DURATION_SEC to btc-vault constants.

## What Was Done

- **constants.ts:** Added `EPOCH_DURATION_SEC = 6 * 24 * 3600` (6 days) with TODO comment to align with product/config.
- **useEpochState.ts:** Replaced useQuery + MOCK_EPOCH with:
  - `useReadContract` for `currentEpoch()` (no args).
  - `useReadContracts` for four calls: `epochSnapshot(epochId)`, `epochRedeemClaimable(epochId)`, `openEpochPendingDepositAssets()`, `epochTotalRedeemShares(epochId)`; batch enabled when `epochId !== undefined`.
  - Separate `useReadContract` for `epochSnapshot(epochId - 1)` when `epochId > 0n` to get startTime (previous epoch closedAt).
  - useMemo: parse batch and prev snapshot; derive status (closedAt === 0 → open; else claimable → claimable; else settling), navPerShare for closedAt > 0 as `(assetsAtClose * 10n**18n) / (supplyAtClose || 1n)`, startTime from prev snapshot or 0, endTime = startTime + EPOCH_DURATION_SEC; build EpochState; return `{ data: toEpochDisplay(rawState) ?? undefined, isLoading, error, refetch }`.
- Removed MOCK_EPOCH, SIX_DAYS_SEC, ONE_BTC, and useQuery.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Previous epoch snapshot read via separate `useReadContract` instead of a 5th slot in useReadContracts | Simpler indexing and same number of RPC calls; avoids variable-length batch and index shift when epochId === 0. | None; behavior matches plan. |

## Discoveries

- `epochSnapshot` returns tuple `[closedAt, assetsAtClose, supplyAtClose, syntheticAddedAssets]`; closedAt is uint64, cast to Number for startTime/settledAt.
- Lint and lint-tsc pass in worktree. Running `npm run test` from the worktree fails with "Cannot find module '.../dao-frontend/vitest.setup.ts'" (path resolves to main repo). Tests likely need to be run from main repo root or with adjusted vitest config when using a worktree.

## Plan Amendments

None. Plan Amendments table in STORY-002-plan.md unchanged.

## Notes for Code Review

- Status is derived only as 'open' | 'settling' | 'claimable'; 'closed' is never emitted per story.
- refetch calls refetchCurrent, refetchBatch, and refetchPrev so all reads can be refreshed.
- Phase 2 will add useEpochState.test.ts and any lint fixes if needed.
