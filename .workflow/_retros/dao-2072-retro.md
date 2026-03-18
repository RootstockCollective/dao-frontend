# Retrospective: dao-2072

## Wire BTC vault frontend hooks to existing BTC Vault history API

**Date:** 2025-03-18  
**Phases:** 4 implementation phases + 1 DRY follow-up  
**Author:** Retro Agent (manual run)

---

## Summary

dao-2072 (STORY-001) was delivered in four phases (data layer → useRequestHistory → useRequestById → cleanup) with high plan adherence. Code review surfaced DRY violations (duplicated action types and pagination type; test mock signature) that were fixed in a follow-up pass. Phases 1–4 went smoothly with no blocking deviations; the main learning is that "reuse existing types/constants from main" was not explicitly in the plan or rules, so the Architect and Developer introduced local constants that duplicated API schemas until Code Review caught them. QA and the follow-up review confirmed all ACs and no regressions.

---

## What Went Well

1. **Phased plan matched execution.** Each phase had 1–3 ACs, one layer, and <5 files; devlogs show implementation aligned with plan steps. Phase 1 (mapper + filter mapping), Phase 2 (useRequestHistory), Phase 3 (useRequestById), Phase 4 (cleanup) were delivered in order with no rework.

2. **Co-located tests and validation gate.** All four phases delivered tests next to source (mappers.test.ts, history-filter-mapping.test.ts, useRequestHistory.test.ts, useRequestById.test.ts). Build, lint, lint-tsc, and tests passed after each phase. No tests depended on removed mocks after Phase 2.

3. **Code review was actionable.** The review identified concrete DRY issues (DEPOSIT_API_TYPES/REDEEM_API_TYPES vs schemas; BtcVaultHistoryPagination vs PaginationResponse; DEPOSIT_ACTIONS in mappers; useRequestById mock signature) with clear "reuse from where" guidance. All were fixed in one follow-up; follow-up review confirmed PASS.

4. **Reuse where already specified.** The plan and devlogs correctly re-exported BtcVaultHistoryItemWithStatus from the API action and used existing formatters (formatEther, shortenTxHash, formatTimestamp, formatDateShort, DISPLAY_STATUS_LABELS). The gap was only in "check API/schemas for constants and shared types before defining new ones."

5. **QA validated full story.** Single full-story QA report validated all 7 ACs and the validation gate; verdict PASS and ready to merge.

---

## What Didn't Go Well

1. **DRY violations introduced and caught only in review.** The Architect's plan did not instruct "derive or import action types and pagination type from existing API/schemas." The Developer introduced local DEPOSIT_API_TYPES/REDEEM_API_TYPES in history-filter-mapping.ts, local DEPOSIT_ACTIONS in mappers.ts, and custom BtcVaultHistoryPagination in api-types.ts. These duplicated or diverged from `src/app/api/btc-vault/v1/schemas.ts` and `src/app/api/utils/types.ts`. Code Review caught them; a follow-up implementation and second review were needed.

2. **Test mock lagged real API.** TransactionDetailPage.test.tsx mocked useRequestById with a single argument `(id) => mockUseRequestById(id)` while the real hook became `useRequestById(id, address)`. Tests still passed because the second arg was optional at the mock level, but the mock did not reflect the real contract. Code Review recommended updating the mock; it was fixed in the DRY pass.

3. **Commit signing environment.** Devlogs (Phases 1, 3, 4) note commits were created with `--no-gpg-sign` because the environment could not access the GPG agent. This is an environment/orchestration constraint, not a rule violation; humans can amend with `--gpg-sign` locally if required.

---

## Plan vs Reality

| Phase | Planned | Actual | Delta |
|-------|---------|--------|-------|
| 1 | API→display mapper; historyFiltersToApiTypes; api-types; tests | Same; devlog notes pagination defined locally; transactionHash empty→null | On-track |
| 2 | useRequestHistory fetches API; buildHistoryUrl; mapper + client-side status filter; remove mock/applyFilters/paginate; BtcVaultHistoryTable sortField | Same; mock-data.ts left in place for Phase 4 | On-track |
| 3 | mapApiItemToVaultRequest; useRequestById(id, address) fetches history, find by id; TransactionDetailPage passes address; remove MOCK_REQUESTS | Same; mock-data not deleted (Phase 4) | On-track |
| 4 | Delete mock-data; remove applyFilters/paginate refs; update tests; lint/tsc; grep for MOCK_REQUESTS/NEXT_PUBLIC_MOCK_BTC_VAULT | Same; BtcVaultDashboard kept NEXT_PUBLIC_MOCK_BTC_VAULT for hasHistory | On-track |
| (post-merge) | — | Code review: DRY recommendations. Follow-up: schemas export DEPOSIT_ACTION_TYPES, REDEEM_ACTION_TYPES, DEPOSIT_ACTIONS; api-types use PaginationResponse; history-filter-mapping + mappers use schemas; TransactionDetailPage mock (id, address) | Deviated (extra pass; not in original plan) |

### Deviations

- **Phase 1:** Empty/whitespace `transactionHash` mapped to null for submitTxShort/submitTxFull (UI should not show empty string). Documented in devlog; no plan change.
- **Phases 1–4:** Commit signing: `--no-gpg-sign` in agent environment. Documented in devlogs; human can amend.
- **After Phase 4:** Code review recommended DRY fixes. Implemented in a separate pass: single source of truth for action types in schemas, PaginationResponse for API response pagination, useRequestById mock signature. Root cause: plan and rules did not require "check existing API/schemas for types and constants before defining new ones."

---

## Recurring Issue Patterns

| Pattern | Occurrences | Severity | Example |
|---------|-------------|----------|---------|
| New types/constants duplicate existing API or shared types | 3 (action types in 2 files, pagination type in 1) | Medium | history-filter-mapping.ts DEPOSIT_API_TYPES vs schemas ActionTypeEnum; api-types BtcVaultHistoryPagination vs PaginationResponse |
| Test mocks not updated when hook/API signature changes | 1 | Low | TransactionDetailPage.test.tsx useRequestById(id) vs useRequestById(id, address) |
| Environment constraint (GPG) | 3 (phases 1, 3, 4) | Low | Devlogs note --no-gpg-sign |

---

## Proposed Rule Changes

> The human orchestrator reviews each proposal and decides whether to apply it.
> The flywheel: each story's retro makes the rules better, which makes the next story's agents produce fewer findings.

### Proposal 1: Architect — "Reuse existing types/constants" checklist

**Type:** `add-rule`  
**Target file:** `.workflow/rules/architecture-patterns.md`  
**Finding:** dao-2072 introduced DEPOSIT_API_TYPES, REDEEM_API_TYPES, DEPOSIT_ACTIONS, and BtcVaultHistoryPagination that duplicated or subsetted types/constants already in `src/app/api/btc-vault/v1/schemas.ts` and `src/app/api/utils/types.ts`. Code Review caught this; a follow-up implementation was needed.  
**Justification:** Adding an explicit "before introducing new types or constants, check existing API and shared modules" step in the Architect's plan reduces duplicate types and keeps the codebase DRY without relying on Code Review to catch it every time.

**Proposed diff:**

```diff
 ## Phase Design Guidelines

 ### Sizing — small, blame-friendly phases
+- **Reuse over redefining:** When the story touches an existing API or feature, the plan MUST instruct the Developer to reuse or extend types/constants from the API layer (e.g. `src/app/api/.../schemas.ts`, `src/app/api/utils/types.ts`) or shared modules instead of defining new parallel types/constants, unless the plan explicitly justifies a separate frontend-only contract.
 - **Target 1–3 ACs per phase.**
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

### Proposal 2: Developer — "Check API/schemas for types and constants" in implementation steps

**Type:** `amend-rule`  
**Target file:** `.workflow/agents/developer.md` (or `.workflow/rules/coding-conventions.md` if preferred in rules)  
**Finding:** The Developer implemented Phase 1 by defining local constants and a custom pagination type without checking that the same values or shapes already existed in the API schemas and utils.  
**Justification:** A single line in the Developer's "Implement the Phase" instructions to check existing API/schemas before adding new types or constants would reinforce the Architect's plan and reduce DRY fixes in review.

**Proposed diff (developer.md):**

```diff
 ### Step 2: Implement Code + Tests Together
+- Before adding new types or constants (especially enums, action type lists, pagination shapes), check whether they already exist in the API layer (e.g. `src/app/api/<feature>/` schemas or `src/app/api/utils/types.ts`) or shared modules; reuse or extend them instead of duplicating.
  - Write implementation following existing patterns (see PROJECT.md and `.workflow/rules/`)
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

### Proposal 3: Code Review — Explicit "DRY / reuse" checklist item

**Type:** `add-rule`  
**Target file:** `.workflow/agents/code-review.md`  
**Finding:** Code Review did catch DRY issues and produced concrete recommendations. Making "no duplicate types/constants where API or shared modules already define them" an explicit checklist item ensures this is always considered.  
**Justification:** Codifying what the reviewer already did well makes the behavior consistent and easier for future reviewers to apply.

**Proposed diff:**

```diff
 8. **Review Coding Standards Compliance**
    Use the file-read tool to load each `.workflow/rules/*.md` file and verify the diff complies.
+ 9. **Review DRY / reuse:** For new types, constants, or enums in the diff, check whether the same or a compatible shape already exists in the API layer (`src/app/api/...`) or shared modules; flag duplication and recommend reuse.
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

## Workflow Improvement Suggestions

1. **Full-story vs per-phase review/QA:** For dao-2072, a single full-story code review and a single full-story QA report were used (plus a follow-up review after DRY fixes). This worked well for a 4-phase story with one branch. Consider documenting in the workflow when to use "one report per phase" vs "one report for the full story" (e.g. by phase count or by orchestrator choice).

2. **Retro agent in task tool:** The `/retro` invocation failed because the task tool's `subagent_type` enum does not include `retro`. Adding `retro` to the available subagent types would allow "run /retro" to delegate to the Retro Agent without manual execution.

---

## Action Items

| Item | Owner | Status |
|------|-------|--------|
| Decide on Proposal 1 (Architect — reuse checklist) | Human | [ ] Pending |
| Decide on Proposal 2 (Developer — check API/schemas) | Human | [ ] Pending |
| Decide on Proposal 3 (Code Review — DRY checklist) | Human | [ ] Pending |
| Optionally: add `retro` to task/subagent enum for "run /retro" | Maintainer | [ ] Pending |
| Optionally: amend commits with `--gpg-sign` locally if signing required | Human | [ ] Pending |
