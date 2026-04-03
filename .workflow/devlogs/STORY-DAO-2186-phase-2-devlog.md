# Devlog: STORY-DAO-2186 — Phase 2

**Date:** 2026-04-03  
**Phase:** 2 of 2  
**Developer:** Developer Agent

---

## What Was Planned

- `WithdrawAllowanceStep`: when `isApproving`, render `TransactionInProgressButton` like `WithdrawReviewStep`; idle keeps `Request allowance` with `data-testid="RequestAllowanceButton"`.
- Extend `WithdrawAllowanceStep.test.tsx` for approving state.

## What Was Done

- `WithdrawAllowanceStep.tsx`: import `TransactionInProgressButton` from `@/components/StepActionButtons`; conditional `{isApproving ? <TransactionInProgressButton /> : <Button … data-testid="RequestAllowanceButton">}`; primary button `disabled` when idle no longer redundantly includes `isApproving`.
- `WithdrawAllowanceStep.test.tsx`: `beforeAll` `ResizeObserver` mock (matches `WithdrawReviewStep.test.tsx`); new case asserts **In Progress** and absence of `RequestAllowanceButton` while approving.
- `StakingContext.test.tsx`: Vitest timeout `15_000` on the 500-iteration property-style test so `npm run test` stays green under parallel load (was intermittently &gt; 5s).

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| StakingContext test timeout | Unrelated flake blocking validation gate | More reliable CI/local full suite |

## Discoveries

- `ProgressButton` pulls in `useResizeObserver`; jsdom needs the same mock as other BTC Vault step tests that mount `TransactionInProgressButton`.

## Plan Amendments

Updated local `STORY-DAO-2186-plan.md` **Plan Amendments** (note: `.workflow/plans/` is gitignored in this repo).

## Notes for Code Review

- E2E or selectors that assumed `RequestAllowanceButton` stays mounted during approval must switch to progress UI or wallet flow (already called out in the architecture plan).
- Phase 2 commit includes the Staking timeout tweak; flag if you prefer a separate `chore(test): …` commit on mainline policy.
