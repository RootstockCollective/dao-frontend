# Devlog: STORY-006 — Phase 1

**Date:** 2026-03-26  
**Phase:** 1 of 7 (data layer)  
**Developer:** Developer Agent  

---

## What Was Planned

- Add `src/lib/swap/routes.ts`: resolver for USDRIF↔RIF via USDT0; token topology only (no per-hop fees in table).
- Generalize `encodeSwapPath` with uniform fee per hop; `getQuote` / `getQuoteExactOutput` use `quoteExactInput` / `quoteExactOutput` for multi-hop; Auto = probe standard tiers with same fee on all hops; preserve USDT0↔USDRIF single-hop behavior.
- Extend `UniswapQuoterV2Abi` with bytes-path quote methods.
- Tests: `uniswap.test.ts` + routes tests; mainnet-style RPC tests where applicable; single-hop regression.

## What Was Done

- Implemented `resolveSwapRoute` / `isMultihopRoute` in `src/lib/swap/routes.ts` using `getAddress` and `tokenContracts[RIF]` + `SWAP_TOKEN_ADDRESSES` (env-backed).
- Added `encodeUniformFeeSwapPath` (exported) and exact-output quote path helper (reversed token order per Uniswap exact-output encoding).
- Wired `getUniswapQuote`, `getUniswapExactOutputQuote`, and `getAvailableFeeTiers` to branch on multi-hop vs single-hop; multihop uses one multicall per tier family (`quoteExactInput` / `quoteExactOutput`).
- Extended Quoter ABI with `quoteExactInput` and `quoteExactOutput`; exported ABI as viem `Abi` so `readContract` / `multicall` accept the new selectors (see Plan Amendments).
- Co-located `routes.test.ts` (resolver + path length checks); extended `uniswap.test.ts` with single-hop vs on-chain regression and USDRIF↔RIF vs direct `quoteExactInput` (guarded by `skipIf` / fork).
- Adjusted default Vitest `exclude` so `src/lib/swap/routes.test.ts` runs without fork while other swap RPC tests stay fork-gated.

## Deviations from Plan


| Deviation                                                 | Reason                                                                                           | Impact                                                                                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| No dedicated Vitest “mainnet” project                     | Repo only had default (testnet env) + optional fork; no separate mainnet project.                | On-chain comparisons remain in `uniswap.test.ts` under fork when `FORK_RPC_URL` is set; comments document ≤ 1 wei rule.                 |
| `UniswapQuoterV2Abi` typed as `Abi` instead of `as const` | Viem narrowed `functionName` / `multicall` contracts to single-hop only with the expanded tuple. | Slightly looser ABI typing; runtime unchanged. `readContract` results for multihop asserted via runtime guards + narrow casts in tests. |


## Discoveries

- Rootstock QuoterV2 exposes `quoteExactInput` / `quoteExactOutput` with the standard IQuoterV2 multi-hop shapes (confirmed via implementation + successful `lint-tsc` / tests).
- `multicall({ contracts })` requires homogeneous `functionName` per call list; split `getAvailableFeeTiers` into multihop vs single-hop branches to satisfy TypeScript.

## Plan Amendments

See `## Plan Amendments` in `.workflow/plans/STORY-006-plan.md`.

## Notes for Code Review

- Uniform fee on all hops is intentional (Oku-style); real liquidity may favor mixed tiers on paper, but product rule is one tier repeated in path bytes.
- `getSwapEncodedData` / `getPermitSwapEncodedData` still encode **single-hop** paths only (Phase 4 execution).
- Phase 2+ must not be merged as part of this task per scope.

