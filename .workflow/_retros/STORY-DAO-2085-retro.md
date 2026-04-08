# Retrospective: STORY-DAO-2085

## Add RIF↔WrBTC swaps to the in-app USDT0 swapper

**Date:** 2026-04-07  
**Phases:** 6 planned (architecture plan); **pre-push** — merge pending, retro run before push  
**Author:** Retro Agent

---

## Summary

Work is **implemented** and **engineering-validated** (QA **PASS** on commit `92ab648`), but the **merge is still pending**. There are **no** `STORY-DAO-2085-phase-*-devlog.md` files in `.workflow/devlogs/` (and none for STORY-DAO-2003 either), so plan-vs-actual traceability relies on the **review**, the **`STORY-DAO-2085-swap-wrbtc-qa.md`** handoff, and the **shipped-behavior summary** for `92ab648`. The dominant theme is a **deliberate product/engineering decision** to **stop treating native rBTC and WrBTC as one spendable bucket** for balance, max, %, and smart default—while the **story** and **architecture plan** still describe **combined** native + WrBTC for the BTC-side UX. That **doc–code drift** is the main systemic risk going into merge.

---

## What Went Well

1. **On-chain route clarity:** The plan’s mainnet **one-hop RIF ↔ WRBTC** direction (pools at 500 / 3000 bps) was researched and reflected in routing; review and QA did not flag regressions on core pair behavior for the follow-up commit.
2. **Follow-up commit tightened correctness:** `92ab648` addressed **low-liquidity** (e.g. WrBTC USD alias from RBTC in `useGetSpecificPrices`), **display** (`formatForDisplay` non-positive → `0.00`, RIF swap display decimals), and **honest separation** of WrBTC ERC-20 from native rBTC for amounts users can actually swap—aligning UI with what the DEX can spend without in-modal wrap.
3. **Automated gate strength:** QA reported green **build**, **lint-tsc**, **ESLint (0 errors)**, and **full Vitest** (`1235` tests), plus targeted swap runs—strong confidence for merge from a CI perspective.

---

## What Didn't Go Well

1. **Story and plan are stale relative to shipped behavior:** Technical Notes (smart default / “native and/or WRBTC”) and plan §4.2 / Phases 3–5 still specify **combined** native + WrBTC for max and smart default; code after `92ab648` uses **WrBTC `balanceOf` only**. QA explicitly flagged this as **product/contract** risk and recommended updating story/plan or **Plan Amendments**—the plan’s amendments table remained empty in the loaded artifacts.
2. **Code review artifact vs final commit:** `.workflow/reviews/STORY-DAO-2085-review.md` describes **combined** balances, **`isWrbtcSpendShortage`**, and wrap-first messaging—behavior **removed** by `92ab648` per QA. Reviewers and agents consuming only the review file would be **misled** about current behavior unless they read the QA report or diff.
3. **No phase devlogs:** Without `STORY-DAO-2085-phase-*-devlog.md`, there is no chronological record of when the combined-balance approach was chosen versus when it was reversed, or why—retro and onboarding depend on inferring from QA and git history.

---

## Plan vs Reality

> **Evidence base:** No devlogs. Inferred from `.workflow/plans/STORY-DAO-2085-plan.md`, `.workflow/reviews/STORY-DAO-2085-review.md`, `.workflow/qa-reports/STORY-DAO-2085-swap-wrbtc-qa.md`, and the implementation summary for commit `92ab648`.

| Phase | Planned | Actual | Delta |
|-------|---------|--------|-------|
| **1** — Token list and types | Add `WRBTC` to swap constants, `SwapTokenSymbol`, `useSwapTokens` | Done; review **PASS** | **On-track** |
| **2** — Routes RIF ↔ WRBTC | One-hop mainnet; optional USDT0 fallback if no pool | Direct paths; review notes **direct-only** (no ENV fallback)—accepted tradeoff | **Deviated** (fallback scope; documented in review comments) |
| **3** — BTC spendable hook | `useSwapBtcSideBalances`: native + WRBTC, comment “UX only” | **`92ab648`:** WrBTC-focused reads; **removed** combined balance fields from hook per handoff summary | **Deviated** (major—native no longer summed for swap UX) |
| **4** — Smart default | Order through WRBTC side using **native + WRBTC** for “has BTC” | **`92ab648`:** smart default respects **WrBTC-only** presence; native-only does not select From = WrBTC | **Deviated** |
| **5** — Swap UI | Combined total for max/% when selling BTC; `isWrbtcSpendShortage`-style guard | **`92ab648`:** **WrBTC-only** balance/max/%; **`isWrbtcSpendShortage` removed**; normal insufficient-balance path | **Deviated** |
| **6** — Quote / regression tests | `uniswap.test.ts` and route guards | QA/review: tests extended; fork project still a CI concern from review | **Mostly on-track** (environment caveat unchanged) |

### Deviations

1. **BTC-side balance model (central):** Plan and story assumed **combined native rBTC + WrBTC** for display/max/%/default while keeping **WrBTC** labels. Shipped code **rejects** that model until wrap/unwrap exists in-product: **only WrBTC ERC-20** counts for those UX surfaces. **Root cause:** Product/eng decision to avoid implying spendable balance that the router cannot use without a wrap step; prior plan text optimistically allowed “UX-only” summation.
2. **Removal of `isWrbtcSpendShortage`:** Earlier implementation (per review) added explicit “wrap first” signaling when combined display exceeded WrBTC; final ship **removed** dedicated shortage logic—users see standard over-balance behavior. **Root cause:** Simplified UX once combined display was dropped.
3. **Global display behavior:** `formatForDisplay` now maps non-positive values to `"0.00"` (broader than swap-only); plan had mentioned a possibly separate helper. **Root cause:** Consolidation into one utility—acceptable but broader blast radius than a swap-local formatter.
4. **Documentation not updated in lockstep:** Plan **Plan Amendments** table and story Technical Notes were not updated when the combined-balance approach was abandoned. **Root cause:** Process gap (see rule proposals below); `docs-in-pr.md` discourages casual `.md` churn but does not route **required** workflow updates for deltas.

---

## Recurring Issue Patterns

| Pattern | Occurrences | Severity | Example |
|---------|-------------|----------|---------|
| Workflow **story/plan** text lags **final** implementation | 1 (this story); risk of repeat | **High** | QA §Plan deviations; story Technical Notes still “native and/or WRBTC” |
| **Review artifact** predates **follow-up** fix commit | 1 | **Medium** | Review describes combined + `isWrbtcSpendShortage`; `92ab648` removes them |
| **Missing devlogs** when orchestrator skips logging | 1+ | **Medium** | No `STORY-DAO-2085-phase-*-devlog.md`; weak audit trail for phase sizing and pivots |
| QA filename vs story **Workflow Artifacts** path mismatch | 1 | **Low** | Story points to `STORY-DAO-2085-qa.md`; actual report `STORY-DAO-2085-swap-wrbtc-qa.md` |

---

## Related story skim (STORY-DAO-2003)

**STORY-DAO-2003** (SIWE / Like) and its plan were skimmed for overlap with swap UX. **No material overlap** with DAO-2085 beyond shared workflow conventions.

---

## Proposed Rule Changes

> The human orchestrator reviews each proposal and decides whether to apply it.  
> **Do not** edit `.workflow/rules/` until accepted.

### Proposal 1: Plan and story fidelity when implementation deviates

**Type:** `amend-rule`  
**Target file:** `.workflow/rules/docs-in-pr.md`  
**Finding:** Story and plan still described **combined** native + WrBTC while `92ab648` shipped **WrBTC-only** balances/defaults; QA flagged doc–code drift; Plan Amendments table unused.  
**Justification:** The current rule only warns against *accidental* `.md` churn. It does not tell agents or humans to **update** `.workflow/stories/*.md` and `.workflow/plans/*-plan.md` when QA or retro records an **intentional** spec delta—so the “contract of record” stays wrong for the next agent.

**Proposed diff:**
```diff
 # Docs in PR
 
 - **Never** include `.md` files (e.g. workflow docs, README fragments, notes) in commits unless the user or the plan explicitly requests it.
 - Keeps PRs focused on code and avoids accidental documentation churn.
+ 
+ **Exception — workflow spec drift:** If implementation **intentionally diverges** from `.workflow/stories/STORY-XXX.md` or `.workflow/plans/STORY-XXX-plan.md` (e.g. QA “plan deviations,” retro finding, or PM-approved pivot), the same PR (or a paired PR) **must** update:
+ - the story’s Technical Notes / AC notes as needed, and
+ - the plan’s **Plan Amendments** table (phase, what changed, why, date).
+ Rationale: prevents the next Code Review / QA / agent session from treating obsolete text as the source of truth.
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

### Proposal 2: Code Review — reconcile workflow docs with final diff before approval

**Type:** `add-rule`  
**Target file:** `.workflow/rules/documentation-and-testing.md` *(new subsection at end, or new `workflow-artifacts.md` if preferred)*  
**Finding:** `STORY-DAO-2085-review.md` reflects an **earlier** cumulative diff; final behavior changed in `92ab648` without a companion review update—combined balance and `isWrbtcSpendShortage` described in review are no longer accurate.  
**Justification:** Review agents should **either** re-run on the final merge SHA **or** add an explicit “Superseded by follow-up commit …” note when a fix commit changes UX/product semantics.

**Proposed diff:**
```diff
+# Workflow artifacts vs final diff (Code Review)
+
+- Before **Approve** on a story PR, confirm that `.workflow/reviews/STORY-XXX-review.md` matches the **final** commit range (including follow-up fix commits). If a later commit changes behavior described in the review (e.g. removal of a guard or a balance model pivot), **update the review file** or **add a short addendum** section with the new commit hash and revised bullets.
+- If the story/plan still states superseded behavior, flag it and point owners to **Plan Amendments** / story updates (see `docs-in-pr.md` exception).
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

### Proposal 3: Devlog expectation when orchestrator skips per-phase logs

**Type:** `add-rule`  
**Target file:** `.workflow/rules/documentation-and-testing.md` (or orchestrator checklist in `PROJECT.md` / story template — **propose here as rule file for consistency**)  
**Finding:** No `STORY-DAO-2085-phase-*-devlog.md`; Retro Agent could not compare phase estimates to actuals from devlogs.  
**Justification:** A **single** `STORY-XXX-summary-devlog.md` or mandatory PR description section (“Plan deltas”) restores traceability without requiring every phase file.

**Proposed diff:**
```diff
+## Story devlogs (when phase devlogs are skipped)
+
+- If `.workflow/devlogs/STORY-XXX-phase-*-devlog.md` files are **not** produced, the **Developer** or **human orchestrator** must add **one** of: (a) `STORY-XXX-implementation-notes.md` in `.workflow/devlogs/`, or (b) a PR section **Plan vs reality** listing phase-level deltas and key commits.
+- Retro and QA agents use this as the primary timeline when phase devlogs are missing.
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

### Proposal 4: QA report path consistency in story frontmatter

**Type:** `amend-rule`  
**Target file:** `.workflow/rules/documentation-and-testing.md` (or story template — cite as target the file humans edit for “Workflow Artifacts”)  
**Finding:** QA saved `STORY-DAO-2085-swap-wrbtc-qa.md` while the story links `STORY-DAO-2085-qa.md`; agents using default glob `phase-*-qa.md` might miss the file.  
**Justification:** One canonical path per story reduces missed reads.

**Proposed diff:**
```diff
+## QA report naming
+
+- Prefer `.workflow/qa-reports/STORY-XXX-qa.md` **or** `STORY-XXX-phase-N-qa.md`. If a non-standard name is used (e.g. topic suffix), the **story Workflow Artifacts** section must list the **exact** filename, and the QA agent should paste the path in the report header (as done in `STORY-DAO-2085-swap-wrbtc-qa.md`).
```

**Human decision:** [ ] Accept | [ ] Reject | [ ] Modify

---

## Workflow Improvement Suggestions

1. **Architect prompt:** When the plan says “may combine native + wrapped for UX,” add an explicit **decision checkpoint**: “If wrap is not in scope, default spec is **WrBTC ERC-20 only** for max/default unless PM overrides.” That would have aligned plan text with the eventual `92ab648` direction earlier.
2. **Retro Agent default:** Allow retro **before push** (as here) with template flag **pre-push** so merge-pending work still feeds the flywheel.
3. **Story status:** Checkbox cleanup (story still shows Draft / unchecked ACs) — human housekeeping so Done stories do not look abandoned.

---

## Action Items

| Item | Owner | Status |
|------|-------|--------|
| Update `STORY-DAO-2085` story Technical Notes + AC notes for **WrBTC-only** balance / smart default (or attach PM sign-off in Jira) | Human / PM | [ ] Pending |
| Add row to `STORY-DAO-2085-plan.md` **Plan Amendments** for `92ab648` BTC-side model | Human / Developer | [ ] Pending |
| Add review addendum or re-review final SHA so review matches `92ab648` | Human / Code Review | [ ] Pending |
| Decide on rule proposals above | Human orchestrator | [ ] Pending |
| Merge PR after product acknowledgment of plan delta | Human | [ ] Pending |
