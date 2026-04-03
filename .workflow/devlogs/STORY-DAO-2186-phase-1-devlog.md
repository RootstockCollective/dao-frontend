# Devlog: STORY-DAO-2186 — Phase 1

**Date:** 2026-04-03  
**Phase:** 1 of 2  
**Developer:** Developer Agent

---

## What Was Planned

- Change `TransactionInProgressButton` visible label from sentence case to **In Progress** (title case).
- Grep/update RTL tests asserting `In progress` (`WithdrawReviewStep.test`, `DepositReviewStep.test`, `CancelRequestModal.test`, any others).

## What Was Done

- Updated `src/components/StepActionButtons/TransactionInProgressButton.tsx` label to `In Progress`.
- Updated expectations and test titles in:
  - `src/app/btc-vault/components/WithdrawReviewStep.test.tsx`
  - `src/app/btc-vault/components/DepositReviewStep.test.tsx`
  - `src/app/btc-vault/request-history/[id]/components/CancelRequestModal.test.tsx`
- Grep confirmed no remaining `'In progress'` string assertions in `*.test.*` (only a mention in `docs/spike-transaction-balance-updates.md`, left unchanged — not part of RTL suite).

## Deviations from Plan

| Deviation | Reason | Impact |
|-----------|--------|--------|
| Validation run uses `PROFILE=testnet` for `npm run build` | Worktree has no root `.env`; default profile resolves to missing `.env` and build fails during page data collection for `/api/btc-vault/metrics` (`currentEnvChain` / client init). | Local/CI agents should set `PROFILE` or provide `.env` per project docs. Documented in plan amendments. |

## Discoveries

- `npm run build` without `PROFILE` (and without `.env`) fails in this worktree; `PROFILE=testnet` loads `.env.testnet` via `next.config.mjs` dotenv and build completes.

## Plan Amendments

See `STORY-DAO-2186-plan.md` — added validation note in **Plan Amendments**.

## Notes for Code Review

- Global copy change: every consumer of `TransactionInProgressButton` now shows **In Progress** (title case), per Jira/plan.
- Confirm product is OK with title case everywhere (plan called this out as the chosen approach vs optional `label` prop).
