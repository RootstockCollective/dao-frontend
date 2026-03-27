# Devlog: STORY-006 — Phase 4

**Date:** 2026-03-26  
**Phase:** 4 of 7  
**Developer:** Developer Agent  

---

## What Was Planned

- **Step 4.1:** Ensure the first token in the encoded V3 path matches `tokenIn` and aligns with Permit2 `details.token`; fix mismatches if any.
- **Step 4.2:** Fork Vitest tests for USDRIF→RIF and RIF→USDRIF execution or simulation; use encoding/static checks if full `writeContract` is impractical.
- Wire `amountOutMinimum` / slippage consistency with multihop quotes (exactIn / exactOut).
- Optional: DRY explicit-tier `catch` blocks in `uniswap.ts`.

## What Was Done

1. **Execution path audit (no code fix):**
  - `usePermitSigning` → `createSecurePermit({ token: tokens[tokenIn].address, … })` — permit is always on **tokenIn**.  
  - `encodeExecuteSwapPath` with `hopFees` uses `resolveSwapRoute(tokenIn, tokenOut).tokens` and `encodePerHopFeeSwapPath`; for USDRIF↔RIF the resolver returns `[tokenIn, USDT0, tokenOut]`, so path leading token equals **tokenIn** in both directions.
2. **Slippage / quote alignment:** Documented in `SwapStepThree.tsx` that `quote.amountOut` is the Quoter exact-in output for **exactIn**, and the user’s target output for **exactOut** while execution remains `V3_SWAP_EXACT_IN` with `quote.amountIn` — slippage on min-out still matches the router’s exact-in semantics.
3. **Fork tests:** Added `**multihop execution encoding`** in `src/lib/swap/providers/uniswap.test.ts`: for small **USDRIF→RIF** and **RIF→USDRIF** swaps, assert provider quote raw out matches on-chain `quoteExactInput` for the same path bytes, decode `getPermitSwapEncodedData` V3 input and assert path equals resolver-built path (case-insensitive hex) and starts with `tokenIn`. Commands `0x0a00` asserted. No live `execute` (would need real permit signature + balance).
4. **Elite review follow-up (post `b88b3dd9`):** Tests no longer **vacuously pass** on quote failure (explicit `expect` on `result.error` / `hopFees`); shared `assertPermitBundlePathMatchesQuoter` removes duplication; `mockPermitForTests(token, tokenDecimals)` uses **tokenIn** decimals for `parseUnits`. Phase 4 commit subject stays historical; subsequent commit documents test-only tightening.
5. **DRY:** Introduced `swapQuoteNoLiquidityExplicitTier` and replaced four duplicated explicit-tier quoter-revert `catch` branches in `getUniswapQuote` / `getUniswapExactOutputQuote`.

## Deviations from Plan


| Deviation                                        | Reason                                                                                           | Impact                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| No on-chain `UniversalRouter.execute` simulation | Requires valid Permit2 signature and funded account; not practical as a deterministic unit test. | Encoding + quoter agreement tests cover path topology and amounts instead. |


## Discoveries

- ABI-decoded `bytes path` is normalized to lowercase hex; resolver paths use checksummed addresses — tests must compare paths case-insensitively.

## Plan Amendments

- **Naming:** Phase 4 primary commit `feat(swap): execute multihop swaps via universal router` primarily delivered **encoding + quoter tests** and provider DRY—not a production execution-path code change. Prefer `test(swap): …` / `refactor(swap): …` split for similar changes going forward.

## Notes for Code Review

- Phase 4 does not change router command layout beyond existing `PERMIT2_PERMIT` + `V3_SWAP_EXACT_IN`; new tests lock path bytes to `quoteExactInput` for both multihop directions.
- **Phase 5 follow-up:** API `/api/swap/quote` parity with client resolver + multihop (per plan).

