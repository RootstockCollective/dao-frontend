# Architecture Plan: BTC-VAULT-001

## BTC Vault route with feature flag gating and page shell

**Story:** BTC-VAULT-001  
**Author:** Architect Agent  
**Date:** 2025-02-19  
**Status:** Pending Approval

---

## 1. Summary

Scaffold the BTC Vault page at `/btc-vault` behind a feature flag, following the existing USDRIF Vault pattern. Add the `btc_vault` feature flag, route constant, env variables, server-side feature-flag wrapper for the route, header title via `routePatterns`, and a client-side page component with placeholder layout zones for future features (metrics, dashboard, actions, queue, history). No changes to the existing `/vault` route or other routes.

### Key Decisions

- Use `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })` for the route entry, mirroring `src/app/vault/page.tsx`.
- Use a single client component `BtcVaultPage.tsx` with placeholder divs and comments for each zone (F3–F10), matching the VaultPage flex-col layout pattern.
- Add `btcVault = '/btc-vault'` to `src/shared/constants/routes.ts` and use the same env + feature-flag pattern as `vault` in `features.conf.ts` and `FEATURE_FLAGS`.

---

## 2. Requirements Breakdown

| AC   | Requirement                                                                 | Implementation Approach                                                                 |
|------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| AC-1 | BTC Vault page accessible at /btc-vault when flag on                       | `page.tsx` wrapped with `withServerFeatureFlag(..., { feature: 'btc_vault' })`; flag from `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` |
| AC-2 | Navigating to /btc-vault when flag off redirects to /                      | Same wrapper with `redirectTo: '/'` when `getEnvFlag('btc_vault')` is false            |
| AC-3 | TopPageHeader shows "BTC VAULT" on /btc-vault                               | Add `{ pattern: /^\/btc-vault$/, component: <HeaderTitle variant="h1">BTC VAULT</HeaderTitle> }` to `routePatterns` |
| AC-4 | Page renders layout zones as placeholder sections                          | `BtcVaultPage.tsx`: five placeholder divs with data-testid and comments (metrics, dashboard, actions, queue, history) |
| AC-5 | Page is 'use client' following VaultPage pattern                            | `BtcVaultPage.tsx` with `'use client'`, flex-col layout, no vault-specific providers (just layout) |
| AC-6 | Route constant btcVault exported from routes.ts                            | Add `btcVault = '/btc-vault'` to `src/shared/constants/routes.ts`                       |
| AC-7 | Existing /vault and other routes unaffected                                 | No edits to vault app dir or other routePatterns; only additive changes               |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/config/features.conf.ts` | Modify | Add `btc_vault: 'BTC Vault page'` to `features` object |
| `src/lib/constants.ts` | Modify | Add `btc_vault` to `FEATURE_FLAGS`; add `BTC_VAULT_ADDRESS` from `NEXT_PUBLIC_BTC_VAULT_ADDRESS` |
| `src/shared/constants/routes.ts` | Modify | Add `btcVault = '/btc-vault'` |
| `src/shared/walletConnection/constants.tsx` | Modify | Add BTC Vault entry to `routePatterns` (regex `/^\/btc-vault$/`, title "BTC VAULT") |
| `src/app/btc-vault/page.tsx` | Create | Default export: `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })` |
| `src/app/btc-vault/BtcVaultPage.tsx` | Create | `'use client'` component with flex-col layout and five placeholder zones |
| `.env.dev` | Modify | Add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT`, `NEXT_PUBLIC_BTC_VAULT_ADDRESS` |
| `.env.testnet.local` | Modify | Same env vars |
| `.env.fork` | Modify | Same env vars |

---

## 4. Architecture Decisions

### 4.1 Feature flag and route entry

**Decision:** Use the same pattern as the USDRIF Vault: `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })` in `src/app/btc-vault/page.tsx`.

**Rationale:** Keeps behavior consistent with `/vault`, ensures redirect happens server-side before client render, and reuses existing FeatureFlag types (adding `btc_vault` to `Feature` via `features.conf.ts` and `FEATURE_FLAGS`).

**Pattern Reference:** PROJECT.md — Feature Flag System; existing `src/app/vault/page.tsx`.

### 4.2 Page component as client-only with placeholder zones

**Decision:** Single `'use client'` component `BtcVaultPage.tsx` with a flex-col container and five placeholder divs (metrics, dashboard, actions, queue, history), each with a short comment and data-testid for QA.

**Rationale:** Matches VaultPage structure (client component, flex-col, no heavy logic). Placeholders unblock F3–F10 without requiring real content. No extra context providers unless a later story needs them.

**Pattern Reference:** PROJECT.md — Component Conventions; `src/app/vault/VaultPage.tsx` layout shape.

### 4.3 Header title via routePatterns

**Decision:** Add one entry to `routePatterns` in `src/shared/walletConnection/constants.tsx`: pattern `/^\/btc-vault$/`, component `<HeaderTitle variant="h1">BTC VAULT</HeaderTitle>`.

**Rationale:** TopPageHeader already resolves title from `routePatterns` via pathname; adding this entry is the minimal change and matches the USD VAULT entry.

**Pattern Reference:** Existing `routePatterns` and `src/shared/walletConnection/utils.ts` (match by pathname).

### 4.4 Environment and constants

**Decision:** Add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS` to `.env.dev`, `.env.testnet.local`, and `.env.fork`; add `BTC_VAULT_ADDRESS` to `src/lib/constants.ts` (for future contract use).

**Rationale:** Ticket specifies these env files; centralizing the address in `constants.ts` follows PROJECT.md (no hardcoded addresses). Other env profiles (e.g. mainnet, cr.qa) can be updated when BTC Vault is rolled out there.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA.

### Phase 1: Feature flag, route, and header

**Acceptance Criteria Covered:** AC-1, AC-2, AC-3, AC-6

**Files to Create/Modify:**

- [ ] `src/config/features.conf.ts` — add `btc_vault` to `features`
- [ ] `src/lib/constants.ts` — add `btc_vault` to `FEATURE_FLAGS`, add `BTC_VAULT_ADDRESS`
- [ ] `src/shared/constants/routes.ts` — add `btcVault = '/btc-vault'`
- [ ] `src/shared/walletConnection/constants.tsx` — add BTC Vault to `routePatterns`
- [ ] `src/app/btc-vault/page.tsx` — create route entry with `withServerFeatureFlag(BtcVaultPage, ...)`
- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — create minimal `'use client'` shell (single root div; zones added in Phase 2)
- [ ] `.env.dev`, `.env.testnet.local`, `.env.fork` — add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS` (placeholder address in dev/testnet/fork is fine, e.g. empty or existing test address)

**Implementation Steps:**

- [ ] **Step 1.1:** Add `btc_vault: 'BTC Vault page'` to `features` in `features.conf.ts`.
- [ ] **Step 1.2:** In `src/lib/constants.ts`, add `btc_vault: process.env.NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT ?? ''` to `FEATURE_FLAGS` and `BTC_VAULT_ADDRESS = process.env.NEXT_PUBLIC_BTC_VAULT_ADDRESS as Address` (optional cast for when address is not yet set).
- [ ] **Step 1.3:** In `routes.ts`, add `btcVault = '/btc-vault'`.
- [ ] **Step 1.4:** In `constants.tsx`, add `{ pattern: /^\/btc-vault$/, component: <HeaderTitle variant="h1">BTC VAULT</HeaderTitle> }` to `routePatterns` (after the `/vault` entry for consistency).
- [ ] **Step 1.5:** Create `src/app/btc-vault/BtcVaultPage.tsx`: `'use client'`, single root div with `data-testid="btc-vault-page"` and VaultPage-style layout class (`flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm`). No zones yet.
- [ ] **Step 1.6:** Create `src/app/btc-vault/page.tsx`: import `withServerFeatureFlag` and `BtcVaultPage`; default export `withServerFeatureFlag(BtcVaultPage, { feature: 'btc_vault', redirectTo: '/' })`.
- [ ] **Step 1.7:** Add to each of `.env.dev`, `.env.testnet.local`, `.env.fork`: `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=true` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS=` (or a placeholder address).

**Tests to Write:**

- [ ] `withServerFeatureFlag` already has tests; ensure no regressions.
- [ ] Unit test (or small integration): with flag on, route resolves; with flag off, redirect to `/` (can be done via existing feature-flag tests or a minimal page test that mocks `getEnvFlag`).
- [ ] Optional: test that `routePatterns` contains a pattern matching `/btc-vault` and returns the BTC VAULT title component (e.g. in constants or header utils test).

**Cleanup:**

- [ ] None for this phase.

### Phase 2: Page layout zones

**Acceptance Criteria Covered:** AC-4, AC-5

**Files to Create/Modify:**

- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — add five placeholder layout zones inside existing root

**Implementation Steps:**

- [ ] **Step 2.1:** In `BtcVaultPage.tsx`, inside the existing root div, add five placeholder sections in order: (1) Vault Metrics Zone – F3, (2) Dashboard Zone – F4, (3) Actions Zone – F5/F6, (4) Request Queue Zone – F9, (5) History Zone – F10. Each as a div with a brief comment and `data-testid`: `btc-vault-metrics`, `btc-vault-dashboard`, `btc-vault-actions`, `btc-vault-queue`, `btc-vault-history`. Use a single inner `flex flex-col w-full items-start gap-6` container (matching VaultPage content structure) for the five zones.

**Tests to Write:**

- [ ] Render `BtcVaultPage` and assert presence of the five zone nodes (by data-testid or role).
- [ ] Optionally assert layout structure (e.g. flex-col, order of sections).

**Cleanup:**

- [ ] None.

---

## 6. Testing Strategy

| Phase   | Test Type | Test Focus | Key Files |
|---------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | Feature flag and redirect behavior; routePatterns include btc-vault | `withServerFeatureFlag.test.tsx`, possible small test for routePatterns or getHeaderForPath |
| Phase 2 | Unit + Component (RTL) | BtcVaultPage renders and contains all five placeholder zones | `src/app/btc-vault/BtcVaultPage.test.tsx` (co-located) |

### Testing Approach

- Unit tests co-located with source files (`*.test.ts` / `*.test.tsx`).
- Use React Testing Library for `BtcVaultPage` (render, getByTestId).
- Mock feature flag via env or `getEnvFlag` where needed for route/redirect tests.
- No Web3/contract mocks required for this story.

### Coverage Targets

Reference: `.workflow/CONFIG.md` — pages target 60% (non-blocking); focus on unit testing the page component and flag/redirect behavior.

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Feature flag typo or wrong env name | Low | Medium | Use same naming as ticket (`NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT`); add to FEATURE_FLAGS and features.conf in one pass |
| Existing /vault or other routes break | Low | High | No changes to `src/app/vault/` or removal of existing routePatterns; only additive changes; run existing vault and navigation E2E if available |
| Header not showing on /btc-vault | Low | Low | Match regex exactly `/^\/btc-vault$/`; verify TopPageHeader uses pathname and routePatterns order (first match wins if applicable) |
| Env not set in a profile | Low | Low | Document in handoff which env files were updated; add to remaining profiles when rolling out |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
