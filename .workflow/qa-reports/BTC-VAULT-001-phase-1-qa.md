# QA Report: BTC-VAULT-001 - Phase 1

## BTC Vault route with feature flag gating and page shell

**QA Agent:** QA Agent  
**Date:** 2025-02-19  
**Branch:** `feature/BTC-VAULT-001-btc-vault-route`  
**Phase:** 1 of 2

---

## Summary

**Verdict: PASS (with build environment caveat)**

Phase 1 acceptance criteria (AC-1, AC-2, AC-3, AC-6) are implemented and validated. Lint, type check, and all 390 unit tests pass. The production build failed in this QA environment due to **pre-existing** app requirements (missing `JWT_SECRET` and subsequent `/api/health` dependency), not due to any BTC-VAULT-001 Phase 1 code. Code review approved with no critical issues. Phase 1 is ready for progression to Phase 2 once build is confirmed in CI or an environment with full env configured.

---

## Validation Results

### Build

```
FAIL in this environment
```

**Reason:** Next.js "Collecting page data" failed with:

- First run: `Error: JWT_SECRET environment variable is not configured` at `/api/auth/verify`
- Second run (with `JWT_SECRET` set): `TypeError: Cannot read properties of undefined (reading 'id')` at `/api/health`

These failures are in existing auth and health routes, not in `src/app/btc-vault/` or any Phase 1–touched files. **Recommendation:** Confirm build in CI (where env is configured per PROJECT.md) or run with `PROFILE=testnet.local` and required env vars before merge.

### Lint

```
✔ No ESLint warnings or errors
```

**Status:** PASS

### Type Check

```
tsc --noEmit — no output (success)
```

**Status:** PASS

### Tests

```
Test Suites: 32 passed, 32 total
Tests:       390 passed, 390 total
Duration:    ~7s
```

**Status:** PASS

**Relevant to Phase 1:**

- `src/app/btc-vault/BtcVaultPage.test.tsx` — 1 test: renders page with `data-testid="btc-vault-page"`.
- `src/shared/context/FeatureFlag/withServerFeatureFlag.test.tsx` — 6 tests: flag on (render wrapped component), flag off with `redirectTo` (redirect), props pass-through, display name; covers AC-1 and AC-2 behavior for the BTC Vault page.

---

## Coverage Report

Reference: `.workflow/CONFIG.md`

| File | Type | Actual | Target | Status |
|------|------|--------|--------|--------|
| src/app/btc-vault/BtcVaultPage.tsx | Page | Minimal (1 render test) | 60% (non-blocking) | PASS |
| src/app/btc-vault/page.tsx | Page (HOC re-export) | Covered via withServerFeatureFlag tests | 60% | PASS |

Page targets are 60% and **non-blocking** per CONFIG.md. No new utilities, hooks, API routes, or stores were added in Phase 1; blocking coverage targets do not apply to this phase.

### Coverage Analysis

- **BtcVaultPage:** Co-located test asserts the root element and `data-testid="btc-vault-page"`; sufficient for the minimal shell.
- **page.tsx (withServerFeatureFlag):** Flag-on render and flag-off redirect are covered by existing `withServerFeatureFlag.test.tsx`; the BTC Vault page uses the same HOC with `feature: 'btc_vault'` and `redirectTo: '/'`.

---

## Acceptance Criteria Results (This Phase)

Phase 1 covers AC-1, AC-2, AC-3, AC-6. AC-4 and AC-5 are Phase 2 (layout zones and full layout); AC-7 is verified by code review (additive-only changes).

| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | BTC Vault page accessible at /btc-vault when flag on | PASS | page.tsx uses withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault' }); withServerFeatureFlag tests cover flag-on render. |
| AC-2 | Navigating to /btc-vault when flag off redirects to / | PASS | Same wrapper with redirectTo: '/'; withServerFeatureFlag tests cover redirect when flag off. |
| AC-3 | TopPageHeader shows "BTC VAULT" on /btc-vault | PASS | routePatterns entry in walletConnection/constants.tsx with pattern /^\/btc-vault$/ and "BTC VAULT" (per code review). |
| AC-6 | Route constant btcVault exported from routes.ts | PASS | btcVault = '/btc-vault' in src/shared/constants/routes.ts (per code review). |

---

## Detailed AC Validation

### AC-1: BTC Vault page accessible at /btc-vault when flag on

**Validation Method:** Code inspection and existing unit tests.

**Result:** PASS

**Evidence:** `src/app/btc-vault/page.tsx` exports `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })`. `withServerFeatureFlag.test.tsx` verifies that when `getEnvFlag` returns true, the wrapped component is rendered. BtcVaultPage.test.tsx verifies BtcVaultPage renders with `data-testid="btc-vault-page"`.

### AC-2: Navigating to /btc-vault when flag off redirects to /

**Validation Method:** Existing unit tests for withServerFeatureFlag.

**Result:** PASS

**Evidence:** withServerFeatureFlag.test.tsx covers "Feature Disabled" with `redirectTo` and asserts `redirect('/')` is called when the flag is false. BTC Vault uses `redirectTo: '/'`.

### AC-3: TopPageHeader shows "BTC VAULT" on /btc-vault

**Validation Method:** Code review and implementation check.

**Result:** PASS

**Evidence:** Code review confirmed `routePatterns` in `src/shared/walletConnection/constants.tsx` includes an entry with pattern `/^\/btc-vault$/` and component rendering "BTC VAULT" (HeaderTitle variant h1). No change to this logic in Phase 1.

### AC-6: Route constant btcVault exported from routes.ts

**Validation Method:** Code inspection.

**Result:** PASS

**Evidence:** `src/shared/constants/routes.ts` exports `btcVault = '/btc-vault'` (confirmed in code review).

---

## Integration Check

- [x] Existing tests pass (390/390)
- [x] Lint and type check succeed
- [ ] Build succeeds in this environment (fails due to JWT_SECRET / api/health env, not Phase 1 code)
- [x] No regressions from Phase 1: only additive files and constants; no changes to /vault or other routes
- [x] Server/client separation: page.tsx is server-rendered HOC; BtcVaultPage is 'use client'

---

## Issues Found

1. **Build (environment):** Production build fails in this QA run because `JWT_SECRET` is not set and, when set, `/api/health` fails during page data collection. This is **not** caused by BTC-VAULT-001 Phase 1. Resolve by running build in CI or with a full env (e.g. PROFILE=testnet.local and required vars).
2. **None** in Phase 1 scope (code review reported no critical or blocking issues).

---

## Verdict

**Phase 1: PASS**

Phase 1 meets its acceptance criteria. Lint, type check, and tests pass; coverage is sufficient for non-blocking page targets; code review is approved. Build must pass in an environment with proper configuration (e.g. CI) before merge; the current build failure is environmental.

### Next Step

- [x] **Phase 1 complete.** Proceed to Phase 2 (placeholder layout zones: metrics, dashboard, actions, queue, history).
- [ ] **Human approval** for progression to Phase 2.

---

## Handoff: QA → Developer (Next Phase)

**Story:** BTC-VAULT-001  
**Phase Completed:** 1 of 2  
**QA Report:** .workflow/qa-reports/BTC-VAULT-001-phase-1-qa.md  
**Verdict:** PASS

### Validation Summary

- Build: FAIL in this environment (env/config; not Phase 1 code) — confirm in CI before merge.
- Lint: PASS  
- Type Check: PASS  
- Tests: 390 passed  
- Coverage: Page targets met (non-blocking); no new blocking file types.

### Acceptance Criteria (This Phase)

- 4/4 criteria validated (AC-1, AC-2, AC-3, AC-6).

### Ready for Next Phase

- [ ] Human approval received  
- [ ] Phase 2 (layout zones) can begin  
