# Devlog: DAO-2068 — Phase 1 & 2

**Date:** 2025-03-18
**Phase:** 1 and 2 (implementation + tests in one pass)
**Developer:** Developer Agent

---

## What Was Planned

- **Phase 1:** Replace mock data in `useActiveRequests` with two-phase multicall (depositReq/redeemReq → pending/claimable + epochSnapshot), build VaultRequest[] and ClaimableInfo, map via toActiveRequestDisplay, remove mocks.
- **Phase 2:** Add useActiveRequests.test.ts with cases: no address, no request, deposit pending/claimable, redeem pending/claimable, both requests, loading/error.

## What Was Done

- **useActiveRequests.ts:** Implemented two-phase multicall. Phase 1: `depositReq(address)`, `redeemReq(address)` with `useReadContracts` (contracts use `address ?? zeroAddress` so the same tuple type is always passed; `enabled: !!address` prevents RPC when disconnected). Phase 2: when at least one of assets/shares > 0, built dynamic contract list (pendingDepositRequest, claimableDepositRequest, epochSnapshot for deposit; same for redeem when redeem request exists). Parsed Phase 2 results by fixed indices (deposit 0–2, redeem 3–5 when both exist). Derived status: claimable when claimable* > 0, else pending. Built ClaimableInfo from epochSnapshot (closedAt, assetsAtClose, supplyAtClose, syntheticAddedAssets) with `navPerShare = (assetsAtClose + 1n) * 1e18 / (supplyAtClose + 1n)`. Return `[]` when both deposit and redeem are zero; return `undefined` while loading or on error. Removed MOCK_ACTIVE_REQUEST, MOCK_CLAIMABLE_INFO, ONE_BTC, now. Added JSDoc and `'use client'`.
- **useActiveRequests.test.ts:** New file. Mocked `wagmi.useReadContracts` and `@/shared/context/PricesContext` (fixed rbtcPrice 23750). Helper `phase1Result(deposit, redeem)` and `phase2Result(results)`, `snapshotResult(assetsAtClose, supplyAtClose)`. Tests: address undefined → data undefined; no active requests (both zero) → []; deposit pending; deposit claimable (with lockedSharePriceFormatted); redeem pending; redeem claimable; both deposit and redeem → two displays; Phase 1 loading → data undefined; Phase 1 error → data undefined.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Phase 1 contracts when `!address`: use `zeroAddress` in args instead of returning `undefined` | useReadContracts expects a consistent contracts array type; passing `undefined` or `[]` led to TS errors (readonly never[] / 0 elements). Using `(address ?? zeroAddress)` keeps a 2-tuple and `enabled: !!address` ensures no RPC when disconnected. | None; behavior unchanged. |
| Narrowed `phase2Raw` to `readonly { status: string; result?: unknown }[]` before use in useMemo deps | Wagmi’s inferred type for useReadContracts return caused "Type instantiation is excessively deep" in the useMemo dependency array. Cast added with SAFETY comment. | Result access (e.g. snap[1], snap[2]) unchanged; we only read status and result. |

## Discoveries

- Wagmi’s `useReadContracts` with a dynamically built contract array (different length for deposit-only vs redeem-only vs both) leads to very deep TypeScript instantiation; narrowing the return type before using it in useMemo dependencies avoids the error.
- useActionEligibility already reads depositReq/redeemReq for eligibility; useActiveRequests now owns the same reads for display and adds status derivation. No shared hook was introduced.

## Plan Amendments

None recorded in the plan file; deviations are documented in this devlog.

## Notes for Code Review

- Phase 2 contract list is built in useMemo from phase1Data; order is always deposit (if any) then redeem (if any), so result indices are deterministic.
- epochSnapshot result tuple is (closedAt, assetsAtClose, supplyAtClose, syntheticAddedAssets) per ABI; navPerShare uses assetsAtClose and supplyAtClose only.
- Tests use mockReturnValueOnce for Phase 1 then Phase 2 where both calls occur; when there are no requests, Phase 2 is still invoked with an empty contract list (enabled: false).
