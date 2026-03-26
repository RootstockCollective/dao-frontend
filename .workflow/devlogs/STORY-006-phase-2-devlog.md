# Devlog: STORY-006 — Phase 2

**Date:** 2026-03-26  
**Phase:** 2 of 7 (types, store, tokens)  
**Developer:** Developer Agent  

**Commit:** `feat(swap): add RIF to swap token types and store`

---

## What Was Planned

- Extend `SwapTokenSymbol` / `useSwapTokens` with **RIF** (`NEXT_PUBLIC_RIF_ADDRESS` via existing `RIF_ADDRESS` + `tokenContracts`).
- Clarify `useSwapStore` / types: **`poolFee`**, **`poolAddress`**, **`selectedFeeTier`** for multihop (single global fee; `poolAddress` single-hop–oriented).
- Export swap-eligible symbols if useful for UI/helpers.
- Ensure token selection cannot set **tokenIn === tokenOut** when restricting to the three-token domain.

## What Was Done

- **`src/shared/stores/swap/types.ts`:** `SwapTokenSymbol` includes `RIF`; JSDoc on pool fields for single-hop vs uniform multihop fee semantics.
- **`src/shared/stores/swap/useSwapTokens.ts`:** RIF entry with `RIF_ADDRESS`, `getSymbolDecimals(RIF)`.
- **`src/lib/swap/constants.ts`:** `SWAP_TOKEN_ADDRESSES.RIF` from `tokenContracts[RIF]`; **`SWAP_FLOW_TOKEN_SYMBOLS`** `[USDT0, USDRIF, RIF]` for the fixed triple.
- **`src/shared/stores/swap/useSwapStore.ts`:** Module JSDoc; **`pickDistinctPairToken`** drives **`setTokenIn`** / **`setTokenOut`** so the pair stays distinct.
- **`src/shared/stores/swap/useSwapStore.test.ts`:** Collision + happy-path coverage for the new setters.

## Deviations from Plan

| Deviation | Reason | Impact |
| --------- | ------ | ------ |
| No Phase 2 devlog at merge time | Orchestration gap: devlog not in the same session as the commit. | User follow-up; this file backfills. |
| AC-1 UI “RIF selectable” not in this phase | `SwapStepOne` still uses `onTokenChange={() => {}}`; picker work is a later step. | Store/domain ready; users cannot pick RIF in the modal until UI wires `setTokenIn` / `setTokenOut` + token list. |

## Discoveries

- **`SWAP_FLOW_TOKEN_SYMBOLS`** in `lib/swap/constants` keeps the triple in one place; the store imports it for fallback order when resolving collisions (avoids duplicating `[USDT0, USDRIF, RIF]` in Zustand).

## Notes for Code Review

- **`smart-default-direction`** remains USDT0/USDRIF-only on first open; extending defaults for RIF balances is out of scope for Phase 2 (plan references later UX work).

## Notes for Next Phase

- Phase 3: hooks (`useSwapInput`, fee tiers, query keys) should treat route id / multihop consistently with Phase 1 provider behavior.

---

## Workflow note

Per `.workflow/README.md` and `.workflow/agents/retro.md`, the **Retro Agent** runs **after the story is merged** and writes **one** file, `.workflow/_retros/STORY-006-retro.md`, using devlogs, reviews, and QA reports. **Per-phase devlogs** (this file) are the Developer handoff artifact; they are not a substitute for that post-merge retro.
