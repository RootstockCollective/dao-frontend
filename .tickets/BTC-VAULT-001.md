User Story

As a developer setting up the BTC Vault feature, I want to create the BTC Vault route with feature flag gating and a page shell with layout zones, So that the team has a working entry point to build all subsequent BTC Vault features on top of.

Description

Scaffold the BTC Vault page route within the existing dao-frontend app. This creates the foundation that all other BTC Vault features (F2–F10) build upon. The route must be gated behind a feature flag, follow existing vault page patterns, and set up the page layout with placeholder zones for metrics, dashboard, and actions.

What to build

Feature flag: Add btc_vault to the feature flag system (src/config/features.conf.ts) with corresponding env variable NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT

Route: Create src/app/btc-vault/page.tsx using withServerFeatureFlag pattern (redirects to / when flag is off)

Page component: Create src/app/btc-vault/BtcVaultPage.tsx as a 'use client' component with layout zones

Route constant: Add btcVault = '/btc-vault' to src/shared/constants/routes.ts

Header pattern: Add BTC Vault entry to routePatterns in src/shared/walletConnection/constants.tsx so TopPageHeader renders "BTC VAULT" title

Environment config: Add NEXT_PUBLIC_BTC_VAULT_ADDRESS and NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT to env files (.env.dev, .env.testnet.local, .env.fork)

Patterns to follow

Route entry: Follow src/app/vault/page.tsx — wrap with withServerFeatureFlag

Page component: Follow src/app/vault/VaultPage.tsx — 'use client', layout with flex-col, placeholder zones

Feature flag: Follow features.conf.ts const object pattern + FEATURE_FLAGS mapping in src/lib/constants.ts

Header: Follow routePatterns array in src/shared/walletConnection/constants.tsx — add regex /^\/btc-vault$/

Page layout zones (placeholder divs with comments)

┌──────────────────────────────────┐
│  TopPageHeader ("BTC VAULT")     │  ← existing component, new route pattern
├──────────────────────────────────┤
│  [Vault Metrics Zone - F3]       │  ← placeholder
├──────────────────────────────────┤
│  [Dashboard Zone - F4]           │  ← placeholder
├──────────────────────────────────┤
│  [Actions Zone - F5/F6]          │  ← placeholder
├──────────────────────────────────┤
│  [Request Queue Zone - F9]       │  ← placeholder
├──────────────────────────────────┤
│  [History Zone - F10]            │  ← placeholder
└──────────────────────────────────┘


Acceptance Criteria

AC-1: BTC Vault page is accessible at /btc-vault when NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=true

AC-2: Navigating to /btc-vault when the feature flag is off redirects to /

AC-3: TopPageHeader renders "BTC VAULT" as the page title when on the /btc-vault route

AC-4: Page renders layout zones (metrics, dashboard, actions, queue, history) as placeholder sections

AC-5: Page is wrapped in a 'use client' component following the VaultPage.tsx pattern

AC-6: Route constant btcVault is exported from src/shared/constants/routes.ts

AC-7: Existing vault page (/vault) and all other routes are unaffected

Technical Notes

Key files to modify

src/config/features.conf.ts — add btc_vault key

src/lib/constants.ts — add to FEATURE_FLAGS mapping and add BTC_VAULT_ADDRESS constant

src/shared/constants/routes.ts — add route constant

src/shared/walletConnection/constants.tsx — add to routePatterns array

.env.dev, .env.testnet.local, .env.fork — add env variables

Key files to create

src/app/btc-vault/page.tsx — route entry with feature flag

src/app/btc-vault/BtcVaultPage.tsx — page component with layout

Dependencies

None — this is the first story in the BTC Vault epic

Blocks

All other BTC Vault stories depend on this route existing

