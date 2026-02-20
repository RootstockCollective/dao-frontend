# Code Review: BTC-VAULT-001 - Phase 1

## BTC Vault route with feature flag gating and page shell

**Reviewer:** Code Review Agent  
**Date:** 2025-02-19  
**Branch:** `feature/BTC-VAULT-001-btc-vault-route`  
**Phase:** 1 of 2

---

## Summary

**Verdict: Approved**

Phase 1 is correctly implemented: feature flag `btc_vault`, route constant, env variables, server-side feature-flag wrapper, header title via `routePatterns`, and a minimal client-side page shell. The implementation follows the existing Vault pattern and PROJECT.md conventions. No critical or blocking issues. Phase 2 (five placeholder layout zones) is not yet implemented; this review covers Phase 1 only.

---

## Test Coverage

### Tests Exist and Are Co-Located?
- [x] Tests exist for this phase's functionality
- [x] Tests are co-located with source files (*.test.ts / *.test.tsx)
- [x] Test names clearly describe what is being tested

### Test Quality
- [x] Happy path covered (BtcVaultPage renders; withServerFeatureFlag renders when enabled, redirects when disabled)
- [x] Error cases covered (feature-flag redirect and fallback via existing `withServerFeatureFlag.test.tsx`)
- [x] Edge cases considered (flag undefined handled by existing tests)

**Note:** `withServerFeatureFlag` already has tests that cover flag on (render wrapped component), flag off with `redirectTo` (redirect to path), and undefined flag (fallback). The BTC Vault page uses the same HOC with `redirectTo: '/'`, so AC-1 and AC-2 are covered by existing tests. No regressions observed. Optional routePatterns/header test was not added (plan marked it optional).

---

## Checklist Results

### Code Quality
- [x] Types properly defined (no unnecessary `any`)
- [x] Error handling appropriate (feature flag and redirect handled by HOC)
- [x] Follows project patterns (PROJECT.md)
- [x] No hardcoded config values (env and constants used)
- [x] Proper server/client component separation (page.tsx default export is server-rendered HOC; BtcVaultPage is `'use client'`)

### Next.js Patterns
- [x] Correct use of 'use client' directive (BtcVaultPage only)
- [x] Server components used where possible (route entry is server HOC)
- [x] API routes follow Next.js conventions (N/A this phase)
- [x] Proper loading/error state handling (redirect when flag off)

### Web3 Patterns
- [x] Contract ABIs from `src/lib/abis/` (N/A this phase)
- [x] Wagmi hooks used correctly (N/A this phase)
- [x] Transaction states handled (N/A this phase)
- [x] Proper chain/address configuration (BTC_VAULT_ADDRESS from env in constants.ts)

### Security
- [x] No secrets in code
- [x] Input validation present (N/A for this shell)
- [x] HTML sanitized with DOMPurify where needed (N/A)
- [x] No XSS vectors

---

## Coverage Assessment

Reference: `.workflow/CONFIG.md`

| File | Type | Actual | Target | Status |
|------|------|--------|--------|--------|
| src/app/btc-vault/BtcVaultPage.tsx | Page | Minimal (1 render test) | 60% (non-blocking) | PASS |
| src/app/btc-vault/page.tsx | Page (re-export HOC) | Covered via withServerFeatureFlag tests | 60% | PASS |

Page targets are 60% and non-blocking per CONFIG.md. The phase adds a thin shell and relies on existing `withServerFeatureFlag` test coverage for flag/redirect behavior.

---

## Strengths

1. **Exact pattern match with Vault:** Route entry uses `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })` and BtcVaultPage uses the same layout class as VaultPage (`flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm`).
2. **Additive only:** No changes to existing `/vault` or other routes; only new files and additive constants/routePatterns/env entries.
3. **Feature flag and constants:** `btc_vault` added to `features.conf.ts`, `FEATURE_FLAGS`, and `BTC_VAULT_ADDRESS` in `constants.ts`; env vars added to `.env.dev`, `.env.testnet.local`, `.env.fork`.
4. **Header:** `routePatterns` entry added after `/vault` with pattern `/^\/btc-vault$/` and "BTC VAULT" title as specified.

---

## Critical Issues (Must Fix)

None.

---

## Recommendations (Should Fix)

1. **Phase 2 not implemented:** Plan Phase 2 (five placeholder zones: metrics, dashboard, actions, queue, history with data-testids) is not in this branch. Proceed with Phase 2 when ready; no change required for Phase 1 approval.

---

## Acceptance Criteria Check (This Phase)

| AC | Description | Implementation | Status |
|----|-------------|----------------|--------|
| AC-1 | BTC Vault page accessible at /btc-vault when flag on | page.tsx wrapped with withServerFeatureFlag(..., { feature: 'btc_vault' }); flag from NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT | PASS |
| AC-2 | Navigating to /btc-vault when flag off redirects to / | Same wrapper with redirectTo: '/' when getEnvFlag('btc_vault') is false | PASS |
| AC-3 | TopPageHeader shows "BTC VAULT" on /btc-vault | routePatterns entry { pattern: /^\/btc-vault$/, component: <HeaderTitle variant="h1">BTC VAULT</HeaderTitle> } | PASS |
| AC-6 | Route constant btcVault exported from routes.ts | btcVault = '/btc-vault' in src/shared/constants/routes.ts | PASS |

AC-4 and AC-5 are Phase 2 (layout zones and 'use client' with full layout). Phase 1 delivers the minimal shell and 'use client' component; AC-5 is satisfied (page is 'use client').

---

## Conclusion

Phase 1 is complete and approved. Implementation matches the plan and project conventions. Ready for QA for Phase 1 scope (route, flag, redirect, header, minimal page shell). Phase 2 (placeholder zones) can be implemented and reviewed separately.
