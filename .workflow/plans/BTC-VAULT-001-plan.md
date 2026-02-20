# Architecture Plan: BTC-VAULT-001

## BTC Vault Route Scaffold with Feature Flag Gating

**Story:** BTC-VAULT-001
**Author:** Architect Agent
**Date:** 2026-02-19
**Status:** Pending Approval

---

## 1. Summary

Scaffold the `/btc-vault` route with feature flag gating, a page shell with layout placeholder zones, and header integration. This follows the exact same patterns used by the existing `/vault` (USDRIF Vault) route — `withServerFeatureFlag` HOC for server-side gating, a `'use client'` page component with flex-col layout, and a `routePatterns` entry for the TopPageHeader.

### Key Decisions
- **Follow the `/vault` pattern exactly** — `page.tsx` wraps the page component with `withServerFeatureFlag`, `BtcVaultPage.tsx` is a `'use client'` component
- **Feature flag key `btc_vault`** — consistent with the `snake_case` convention in `features.conf.ts` (e.g., `v2_rewards`, `use_the_graph`, `debug_logs`)
- **Placeholder zones as semantic `section` elements** — each zone gets a `data-testid` for QA verification and a comment indicating the future story that fills it
- **Single phase** — all changes are small, tightly coupled, and not independently useful; splitting into multiple phases would add overhead without benefit

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | Page accessible at `/btc-vault` when flag is `true` | Create `src/app/btc-vault/page.tsx` using `withServerFeatureFlag` with `feature: 'btc_vault'` |
| AC-2 | Redirect to `/` when flag is off | `withServerFeatureFlag` config: `redirectTo: '/'` (same as existing vault) |
| AC-3 | TopPageHeader shows "BTC VAULT" | Add regex `/^\/btc-vault$/` to `routePatterns` in `src/shared/walletConnection/constants.tsx` |
| AC-4 | Layout zones rendered as placeholders | `BtcVaultPage.tsx` renders 5 placeholder `section` elements (metrics, dashboard, actions, queue, history) |
| AC-5 | Page is `'use client'` following VaultPage pattern | `BtcVaultPage.tsx` has `'use client'` directive at top |
| AC-6 | Route constant exported | Add `btcVault = '/btc-vault'` to `src/shared/constants/routes.ts` |
| AC-7 | Existing routes unaffected | No modification to existing route files; only additive changes to shared config files |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/config/features.conf.ts` | Modify | Add `btc_vault` feature flag key |
| `src/lib/constants.ts` | Modify | Add `btc_vault` to `FEATURE_FLAGS` mapping + add `BTC_VAULT_ADDRESS` constant |
| `src/shared/constants/routes.ts` | Modify | Add `btcVault` route constant |
| `src/shared/walletConnection/constants.tsx` | Modify | Add BTC Vault entry to `routePatterns` |
| `.env.dev` | Modify | Add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS` |
| `.env.testnet.local` | Modify | Add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS` |
| `.env.fork` | Modify | Add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS` |
| `src/app/btc-vault/page.tsx` | Create | Route entry with `withServerFeatureFlag` |
| `src/app/btc-vault/BtcVaultPage.tsx` | Create | `'use client'` page component with layout zones |

---

## 4. Architecture Decisions

### 4.1 Follow Existing Vault Pattern Exactly

**Decision:** Mirror `src/app/vault/page.tsx` and `src/app/vault/VaultPage.tsx` patterns for the new route.

**Rationale:** The existing vault route is a proven pattern that handles feature flag gating via `withServerFeatureFlag` HOC. Reusing this pattern ensures consistency, reduces review friction, and makes the codebase predictable for future BTC Vault stories (F2-F10).

**Pattern Reference:** Route entry pattern from `src/app/vault/page.tsx`; Feature flag system from `src/config/features.conf.ts` + `src/lib/constants.ts`.

### 4.2 Placeholder Zones as Semantic Sections

**Decision:** Use `<section>` elements with `data-testid` attributes and descriptive comments for each layout zone.

**Rationale:** Semantic sections make the layout self-documenting and testable. Each zone maps to a future story (F3-F10), so `data-testid` values provide a clear contract for QA automation. This also makes it easy for developers on subsequent stories to locate and replace their zone.

### 4.3 BTC Vault Address as Empty Placeholder

**Decision:** Add `NEXT_PUBLIC_BTC_VAULT_ADDRESS` to env files with empty values for now. The actual contract address will be populated when the BTC Vault contract is deployed.

**Rationale:** The ticket specifies adding this env variable. Keeping it empty avoids hardcoding addresses that don't exist yet while establishing the configuration pattern for downstream stories.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer -> Code Review -> QA

### Phase 1: BTC Vault Route Scaffold (Single Phase)

**Acceptance Criteria Covered:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7

**Files to Modify:**
- [ ] `src/config/features.conf.ts` — add `btc_vault: 'BTC Vault page'` to the `features` object
- [ ] `src/lib/constants.ts` — add `btc_vault` to `FEATURE_FLAGS` record + add `BTC_VAULT_ADDRESS` constant
- [ ] `src/shared/constants/routes.ts` — add `export const btcVault = '/btc-vault'`
- [ ] `src/shared/walletConnection/constants.tsx` — add `{ pattern: /^\/btc-vault$/, component: <HeaderTitle variant="h1">BTC VAULT</HeaderTitle> }` to `routePatterns`
- [ ] `.env.dev` — add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=true` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS=`
- [ ] `.env.testnet.local` — add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS=`
- [ ] `.env.fork` — add `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=true` and `NEXT_PUBLIC_BTC_VAULT_ADDRESS=`

**Files to Create:**
- [ ] `src/app/btc-vault/page.tsx` — server component wrapping `BtcVaultPage` with `withServerFeatureFlag`
- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — `'use client'` component with 5 layout zone placeholders

**Implementation Steps:**

- [ ] **Step 1.1:** Add `btc_vault` feature flag to `src/config/features.conf.ts`
  ```typescript
  btc_vault: 'BTC Vault page',
  ```

- [ ] **Step 1.2:** Add `btc_vault` to `FEATURE_FLAGS` in `src/lib/constants.ts` and add `BTC_VAULT_ADDRESS`
  ```typescript
  // In FEATURE_FLAGS record:
  btc_vault: process.env.NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT ?? '',

  // New constant:
  export const BTC_VAULT_ADDRESS = process.env.NEXT_PUBLIC_BTC_VAULT_ADDRESS as Address
  ```

- [ ] **Step 1.3:** Add route constant to `src/shared/constants/routes.ts`
  ```typescript
  export const btcVault = '/btc-vault'
  ```

- [ ] **Step 1.4:** Add header pattern to `src/shared/walletConnection/constants.tsx`
  ```typescript
  { pattern: /^\/btc-vault$/, component: <HeaderTitle variant="h1">BTC VAULT</HeaderTitle> },
  ```
  Place it after the existing vault entry for logical grouping.

- [ ] **Step 1.5:** Create `src/app/btc-vault/page.tsx`
  ```typescript
  import { withServerFeatureFlag } from '@/shared/context/FeatureFlag'
  import { BtcVaultPage } from './BtcVaultPage'

  const BtcVaultPageWithFeature = withServerFeatureFlag(BtcVaultPage, {
    feature: 'btc_vault',
    redirectTo: '/',
  })

  export default BtcVaultPageWithFeature
  ```

- [ ] **Step 1.6:** Create `src/app/btc-vault/BtcVaultPage.tsx`
  ```typescript
  'use client'

  const NAME = 'BTC Vault'

  export const BtcVaultPage = () => {
    return (
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
      >
        {/* Vault Metrics Zone - F3 */}
        <section data-testid="btc-vault-metrics" className="w-full">
          {/* BTC Vault Metrics - implemented in F3 */}
        </section>

        {/* Dashboard Zone - F4 */}
        <section data-testid="btc-vault-dashboard" className="w-full">
          {/* BTC Vault Dashboard - implemented in F4 */}
        </section>

        {/* Actions Zone - F5/F6 */}
        <section data-testid="btc-vault-actions" className="w-full">
          {/* BTC Vault Actions (Deposit/Withdraw) - implemented in F5/F6 */}
        </section>

        {/* Request Queue Zone - F9 */}
        <section data-testid="btc-vault-request-queue" className="w-full">
          {/* BTC Vault Request Queue - implemented in F9 */}
        </section>

        {/* History Zone - F10 */}
        <section data-testid="btc-vault-history" className="w-full">
          {/* BTC Vault History - implemented in F10 */}
        </section>
      </div>
    )
  }
  ```

- [ ] **Step 1.7:** Add env variables to `.env.dev`, `.env.testnet.local`, `.env.fork`

**Tests to Write:**
- [ ] `src/app/btc-vault/BtcVaultPage.test.tsx` — render test verifying all 5 placeholder zones are present via `data-testid`
- [ ] `src/app/btc-vault/page.test.tsx` — test that `withServerFeatureFlag` is called with `feature: 'btc_vault'` and `redirectTo: '/'`

**Cleanup:**
- [ ] Verify `npm run build` passes with new feature flag
- [ ] Verify `npm run lint` passes
- [ ] Verify `npm run lint-tsc` passes
- [ ] Verify `npm run test` passes

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest + RTL) | Page component renders all layout zones | `src/app/btc-vault/BtcVaultPage.test.tsx` |
| Phase 1 | Unit (Vitest) | Feature flag gating and redirect behavior | `src/app/btc-vault/page.test.tsx` |

### Testing Approach
- Unit tests co-located with source files (`*.test.tsx`)
- Use React Testing Library for component render tests
- Mock `withServerFeatureFlag` for page.tsx test to verify correct config is passed
- BtcVaultPage test renders the component and verifies all 5 `data-testid` elements exist
- Reference: `vitest.config.ts` for multi-project setup

### Coverage Targets
- **Pages** (`src/app/**/page.tsx`): 60% target (non-blocking per CONFIG.md)
- Since this is a scaffold with no business logic, basic render tests satisfy the coverage expectations

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Feature flag typo breaks existing flags | Low | High | TypeScript `Feature` type enforces correctness; adding to the `features` const object and `FEATURE_FLAGS` record both require matching keys |
| Route conflicts with existing routes | Low | Medium | `/btc-vault` is a unique path; no existing route uses this prefix |
| Header pattern regex too broad | Low | Low | Using exact match `^\/btc-vault$` prevents matching sub-routes like `/btc-vault/settings` |
| Missing env variable breaks build | Low | Medium | Empty string fallback (`?? ''`) in `FEATURE_FLAGS` prevents runtime errors; `BTC_VAULT_ADDRESS` cast to `Address` is safe because it's not used until downstream stories |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
