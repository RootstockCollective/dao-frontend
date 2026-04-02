# Devlog: STORY-008 — Phase 1 (single-pass)

**Date:** 2026-04-02
**Phase:** 1 of 1 (plan treats STORY-008 as a single implementation slice)
**Developer:** Developer Agent

---

## What Was Planned

Per `STORY-008-plan.md` §6 and §4: make `WalletBalancesTable` mobile-friendly with `useIsDesktop`, `stackFirstColumn={!isDesktop}`, mobile-first wrapper (`w-full`, no base `min-w-[540px]` / unconditional `overflow-x-auto`; `md:min-w-[540px]` and `md:overflow-x-auto` from `md` up), **Show all / Show fewer** at `h-11`, co-located RTL tests mocking `useIsDesktop` for mobile vs desktop, and `min-w-0` on the `WalletBalancesTable` parent in `CapitalAllocationSection`. Do not change `GridTable.tsx` unless blocked.

## What Was Done

- **`WalletBalancesTable.tsx`:** Already matched the plan on branch review (`useIsDesktop`, `stackFirstColumn={!isDesktop}`, outer `w-full md:overflow-x-auto`, `GridTable` `min-w-0 md:min-w-[540px]`, show-all button `h-11`). No further edits required.
- **`CapitalAllocationSection.tsx`:** Wallet column wrapper already includes `min-w-0` on `flex-1` div (`min-h-[200px] min-w-0 flex-1`). Chart column pre-work (`xl:max-w-[480px]`, `min-w-0` on chart wrapper per orchestrator) was outside the plan’s “≤5 files” table scope but supports layout; not reverted.
- **`WalletBalancesTable.test.tsx`:** Mock and mobile `describe` block were already present. **Added** desktop assertions: wrapper and grid responsive classes (`w-full`, `md:overflow-x-auto`, `min-w-0`, `md:min-w-[540px]`), and `h-11` on the show-all button in the desktop path for parity with mobile touch-target checks.
- **`CapitalAllocationDonutChart.tsx`:** No changes this session; legend/tooltip mobile work was noted as already landed per orchestrator.

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| (none in product behavior) | Implementation was largely pre-applied on the feature branch | Tests tightened for desktop responsive classes |

## Discoveries

- `npm run build` could not be completed in this agent session (tool repeatedly failed with “Timeout waiting for bubble creation” before the build started). **`npm run lint`, `npm run lint-tsc`, and `npm run test` all passed** (111 files, 1155 tests). Re-run `npm run build` locally or in CI before merge.

## Plan Amendments

- None added to `STORY-008-plan.md` — no behavioral change vs written plan.

## Notes for Code Review

- Confirm `useIsDesktop` hydration behavior matches expectations (same tradeoff as `MintersTable`).
- Manually spot-check BTC Vault detailed view at ~375px and ~768px per plan §7.
- **Validation:** verify `npm run build` in your environment if the agent run did not record it.
