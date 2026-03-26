# Devlog: STORY-006 — Phase 3

**Date:** 2026-03-26  
**Phase:** 3 of 7 (client hooks — quote + fee tiers)  
**Developer:** Developer Agent  

**Commit:** `feat(swap): multihop quotes with uniform fee tier in swap hooks`

---

## What Was Planned

- `useSwapInput`: provider calls with resolved route; debounce/query keys include **route id**.
- `availableFeeTiers`: multihop probes **uniform** fee on full path; same single Auto + tier UX as single-hop.
- Map provider errors to existing `quoteError` surface.
- Hook or provider tests as feasible.

## What Was Done

- **`getSwapRouteCacheKey`** in `src/lib/swap/routes.ts` (checksum path joined with `:`); unit test for forward vs reverse multihop.
- **`getAvailableFeeTiers`**: multihop branch uses one multicall of `quoteExactInput` per standard tier with **`encodeUniformFeeSwapPath`**; single-hop behavior unchanged.
- **`getUniswapQuote` / `getUniswapExactOutputQuote`**: multihop + explicit `feeTier` uses **`getMultihopQuoteExactInUniformTier`** / **`getMultihopQuoteExactOutUniformTier`**; **Auto** (no tier) still runs best-of **per-hop fee combinations** multicall.
- **`hooks.ts`**: React Query keys `['availableFeeTiers', swapRouteCacheKey]` and `['swapQuote', swapRouteCacheKey, mode, debouncedTypedAmount, selectedFeeTier]`; multihop **`selectedFeeTier`** passed through to provider; removed effect that forced Auto-only on multihop.
- **`SwapStepOne`**: pool fee / Auto controls shown for multihop (Oku-style one control).
- **`uniswap.test.ts`**: multihop available-tier expectation updated; integration test for explicit uniform multihop quote vs direct quoter (fork project).

## Deviations from Plan

| Deviation | Reason | Impact |
| --------- | ------ | ------ |
| No dedicated `hooks.test.ts` | `uniswap.test.ts` + routes cover new provider behavior; hook layer is thin React Query wiring. | Consider hook tests if regressions appear. |
| Auto multihop ≠ uniform-only | Phase 1 provider already optimizes over **all** per-hop tier pairs; changing Auto to uniform-only would reduce quote quality. Manual tier = uniform path only. | Documented in provider JSDoc; matches “best quote + explicit path” product split. |

## Notes for Code Review

- Uniform **manual** tier quotes include **`hopFees`** with the same fee repeated per hop for execution alignment in Phase 4.

## Notes for Next Phase

- Execution must use quoted **`hopFees`** (uniform when user picked a tier; mixed when Auto).
