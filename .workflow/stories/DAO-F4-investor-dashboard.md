# Investor Dashboard — MY METRICS (BTC Vault)

**Story:** DAO-F4
**Feature Zone:** Dashboard Zone - F4 in `BtcVaultPage.tsx`
**Effort Type:** Pattern reuse — adapt existing vault user-metrics pattern for btc-vault

---

## Context

The BTC Vault dApp is a production-grade, KYB-gated, request-based deposit/withdrawal product for professional/institutional users. The investor needs a clear at-a-glance dashboard — titled **"MY METRICS"** — showing their wallet balance, vault position, earnings, and yield. When the wallet is disconnected, the MY METRICS section is hidden entirely. When connected but with no position, metrics display zeros (not dashes).

This story implements the **Dashboard Zone** (`data-testid="btc-vault-dashboard"`) in `src/app/btc-vault/BtcVaultPage.tsx` (line 21–23, currently an empty `<section>` placeholder).

### Pattern to Reuse

Copy and adapt the user-metrics pattern from the existing USDRIF vault:

- **Layout container:** `src/app/vault/components/VaultMetricsContainer.tsx` — wraps metrics in `MetricsContainer` (`src/components/containers/MetricsContainer.tsx`) with `bg-v3-bg-accent-80 divide-y-0` styling.
- **User metrics row:** `src/app/vault/components/VaultUserMetricsContainer.tsx` — uses `BalanceInfo` components in a flex row layout, conditional on `isConnected`.
- **Display component:** `src/components/BalanceInfo/BalanceInfo.tsx` — shared component with props: `amount: ReactNode`, `symbol?: string`, `title?: string`, `tooltipContent?: ReactNode`, `fiatAmount?: ReactNode`, `className?: string`, `data-testid?: string`.

### Key Differences from USDRIF Vault Pattern

1. **Token:** rBTC (not USDRIF/USDT0). Vault shares also display with "rBTC" symbol (not "Shares").
2. **Two-row layout:** USDRIF vault has a single flex-wrap row. BTC Vault design shows two distinct rows of metrics (3 metrics + 4 metrics).
3. **Additional metrics:** Current earnings, total balance, yield % to date — these do not exist in the USDRIF vault pattern.
4. **Fiat amounts:** Design shows USD equivalents below rBTC values (using `BalanceInfo`'s `fiatAmount` prop). USDRIF vault does not show fiat.
5. **Disconnected state:** USDRIF vault hides wallet-specific metrics but shows vault balance. BTC Vault hides the entire MY METRICS section when disconnected.
6. **Empty state:** Design shows **zeros** (`0`, `0 rBTC`, `0%`) for empty values — NOT dashes.
7. **Navigation links:** "View history" and "View yield history" links at the bottom of the section.
8. **Action buttons:** Deposit, Withdraw, and "Swap to/from RBTC" are visually inside the MY METRICS container. The buttons themselves are minimal in this story; full deposit/withdraw flows are implemented in F5/F6.

---

## Prerequisites

- `useUserPosition` hook exists at `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts` — returns `UserPositionDisplay` via React Query. Currently uses mock data.
- `useVaultMetrics` hook exists at `src/app/btc-vault/hooks/useVaultMetrics/useVaultMetrics.ts` — returns `VaultMetricsDisplay` via React Query. Currently uses mock data.
- `useActionEligibility` hook exists at `src/app/btc-vault/hooks/useActionEligibility/useActionEligibility.ts` — returns deposit/withdraw eligibility and block reasons.
- `UserPosition` type exists at `src/app/btc-vault/services/types.ts` with fields: `rbtcBalance`, `vaultTokens`, `positionValue`, `percentOfVault`.
- `UserPositionDisplay` type exists at `src/app/btc-vault/services/ui/types.ts` with formatted strings and raw bigints.
- `toUserPositionDisplay` mapper exists at `src/app/btc-vault/services/ui/mappers.ts`.
- `BalanceInfo` shared component exists at `src/components/BalanceInfo/BalanceInfo.tsx`.
- `MetricsContainer` shared component exists at `src/components/containers/MetricsContainer.tsx`.
- `BtcVaultBanners` already handles wallet-disconnected and not-authorized banner states.
- Feature flag `btc_vault` gates the page via `withServerFeatureFlag`.

---

## Acceptance Criteria

### AC-1: MY METRICS section with two-row layout (wallet connected)

**When** the wallet is connected and `useUserPosition` returns data,
**Then** the dashboard renders a section titled **"MY METRICS"** containing two rows of metrics using `BalanceInfo`:

**Row 1 (3 metrics):**

| Metric | `BalanceInfo` title | Data source | Symbol | Fiat | Tooltip |
|--------|-------------------|-------------|--------|------|---------|
| Wallet balance | "Wallet" | `rbtcBalanceFormatted` | "rBTC" | USD equivalent | Yes ("?") |
| Vault shares | "Vault shares" | `vaultTokensFormatted` | "rBTC" | USD equivalent | Yes ("?") |
| Share of vault | "Your share of vault" | `percentOfVaultFormatted` | *(none — value includes %)* | *(none)* | Yes ("?") |

**Row 2 (4 metrics):**

| Metric | `BalanceInfo` title | Data source | Symbol | Fiat | Tooltip |
|--------|-------------------|-------------|--------|------|---------|
| Principal deposited | "Principal deposited" | `totalDepositedPrincipalFormatted` | "rBTC" | USD equivalent | No |
| Current earnings | "Current earnings" | `currentEarningsFormatted` | "rBTC" | *(none)* | Yes — "Subject to NAV updates, pending deposit windows" |
| Total balance | "Total balance" | `totalBalanceFormatted` | "rBTC" | USD equivalent | Yes ("?") |
| Yield % to date | "Yield % to date" | `yieldPercentToDateFormatted` | *(none — value includes %)* | *(none)* | Yes ("?") |

All metrics inside a `MetricsContainer` with `bg-v3-bg-accent-80 divide-y-0` styling.

**Responsive layout (per `responsive-mobile-first.mdc`):**
- **Mobile (base):** Both rows stack vertically — each metric card is full-width (`w-full`), one per row. Rows use `flex flex-col gap-4`.
- **Desktop (`md:`):** Row 1 is a horizontal flex row (3 cards). Row 2 is a horizontal flex row (4 cards). Cards use `md:w-[214px] md:min-w-[180px]`. Rows use `md:flex-row md:gap-x-6`.

### AC-2: Metric calculations

**Total balance** = `positionValue` (= `vaultTokens × NAV per share`). This value already exists in `UserPosition.positionValue`. In the display layer, map it to `totalBalanceFormatted`.

**Current earnings** = `positionValue - totalDepositedPrincipal`. Derived in the mapper. When `totalDepositedPrincipal` is `0n`, current earnings is `0n` (avoid division by zero in yield calc).

**Yield % to date** = `(currentEarnings / totalDepositedPrincipal) × 100`. Derived in the mapper as a percentage number (e.g., `20.00%`). When `totalDepositedPrincipal` is `0n`, yield is `0%`.

**Fiat USD amounts**: Computed as `rbtcValue × rbtcUsdPrice`. For the mock data layer, use a hardcoded rBTC/USD price constant. When real data integration happens (separate story), this will be replaced with a price feed.

### AC-3: Empty state — zeros for no position

**When** the wallet is connected but the user has no vault position (`vaultTokens === 0n`),
**Then:**
- Wallet balance displays the **actual** rBTC balance (can be non-zero).
- Vault shares displays **`0`** with `rBTC` symbol and `0.00 USD` fiat.
- Your share of vault displays **`0%`**.
- Principal deposited displays **`0`** with `rBTC` symbol and `$0.00` fiat.
- Current earnings displays **`0`** (or `0.00`) with `rBTC` symbol.
- Total balance displays **`0`** with `rBTC` symbol.
- Yield % to date displays **`0%`**.

**No dashes ("—"), no hidden metrics, no onboarding CTA.** The design shows zeros consistently for all empty-position states (KYB approved no activity, No KYB, KYB rejected, Request pending no activity).

### AC-4: Current earnings — real metric, not placeholder

**Current earnings** is a fully functional displayed metric, **not** a deferred placeholder. It shows:
- The derived value `positionValue - totalDepositedPrincipal` formatted as rBTC.
- Tooltip content: "Subject to NAV updates, pending deposit windows".
- For users with no position: `0` rBTC.
- For active users: the actual computed earnings value.

### AC-5: Wallet disconnected — hide MY METRICS entirely

**When** the wallet is not connected,
**Then** the MY METRICS section is **not rendered at all**. The `BtcVaultBanners` component (already implemented) shows the "Wallet Disconnected" banner with "Connect Wallet" CTA. The dashboard `<section>` renders empty or is conditionally hidden.

The design ("Wallet not connected" screen) shows no MY METRICS section — only Vault Metrics (F3), Capital Allocation, Disclosure, and a "Your wallet is not connected" CTA at the page bottom.

### AC-6: Navigation links — View history and View yield history

**When** the user has a vault position (`vaultTokens > 0n`),
**Then** below the metrics rows, display two navigation links:
- **"View history"** (left-aligned, with arrow icon) — links to the history section/route.
- **"View yield history"** (right-aligned, with arrow icon) — links to the yield history view.

**When** the user has no position, these links are hidden.

**Implementation note:** The link targets may be anchors to other page zones (F10) or routes. If the target is not yet implemented, use `#` as the href and add a `// TODO(DAO-XXXX):` comment.

### AC-7: Action buttons — Deposit, Withdraw, Swap

**Then** below the navigation links (or below the metrics rows if no links), the dashboard renders an actions row containing:
- **"Deposit"** button — primary/filled style.
- **"Withdraw"** button — secondary/outlined style.
- **"Swap to/from RBTC"** — text link with external arrow icon.

**Conditional visibility based on design states:**

| State | Deposit | Withdraw | Swap link |
|-------|---------|----------|-----------|
| KYB approved, no activity | Shown | Shown | Shown |
| Request pending | Shown (with tooltip: block reason) | Shown | Shown |
| Request successful | Shown | Shown | Shown |
| Active user | Shown | Shown | Shown |
| Deposits paused | Hidden | Shown | Shown |
| Withdrawals paused | Shown | Hidden | Shown |
| All paused | Hidden | Hidden | Shown |
| No KYB / KYB rejected | Hidden | Hidden | Hidden |

Use `useActionEligibility` to determine `canDeposit` / `canWithdraw` and block reasons. The block reason tooltip (e.g., "You already have a pending deposit request") is shown on hover when the button is visible but the action is blocked.

**Click handlers are no-ops in this story.** The full deposit/withdraw modal flows are implemented in F5/F6. Create a `BtcVaultActions` component with `onDeposit` / `onWithdraw` callback props (initially no-ops) so F5/F6 can wire them up.

### AC-8: Data layer — extend UserPosition with new fields

The following fields must be added to support the design:

**1. `src/app/btc-vault/services/types.ts` — `UserPosition` interface:**

Add:
```
totalDepositedPrincipal: bigint
```
JSDoc: "Cumulative rBTC principal deposited by the user. Wei, 18 decimals."

**2. `src/app/btc-vault/services/ui/types.ts` — `UserPositionDisplay` interface:**

Add:
```
totalDepositedPrincipalFormatted: string
totalDepositedPrincipalRaw: bigint
currentEarningsFormatted: string
totalBalanceFormatted: string
totalBalanceRaw: bigint
yieldPercentToDateFormatted: string
fiatWalletBalance: string
fiatVaultShares: string
fiatPrincipalDeposited: string
fiatTotalBalance: string
```

**3. `src/app/btc-vault/services/ui/mappers.ts` — `toUserPositionDisplay`:**

Update to:
- Map `totalDepositedPrincipal` → formatted via `formatEther`.
- Derive `currentEarnings = positionValue - totalDepositedPrincipal` → formatted via `formatEther`.
- Map `positionValue` → `totalBalanceFormatted` via `formatEther` (reuse existing value).
- Derive `yieldPercentToDate = totalDepositedPrincipal > 0 ? (currentEarnings / totalDepositedPrincipal) * 100 : 0` → formatted via `formatPercent`.
- Compute fiat values using a mock rBTC/USD price constant.

**4. `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts`:**

Add `totalDepositedPrincipal` to `MOCK_POSITION` and `EMPTY_POSITION`:
- `MOCK_POSITION`: e.g., `totalDepositedPrincipal: (52n * ONE_BTC) / 100n` (0.52 rBTC)
- `EMPTY_POSITION`: `totalDepositedPrincipal: 0n`

**5. `src/app/btc-vault/services/ui/mappers.test.ts`:**

Update tests to cover new fields, derived calculations, and edge cases (zero principal, zero position).

### AC-9: Loading state

**When** `useUserPosition` is loading (`isLoading: true`),
**Then** all metric amounts display `"..."` (three dots), consistent with the USDRIF vault loading pattern in `VaultUserMetricsContainer.tsx`.

### AC-10: Section title "MY METRICS"

**Then** the dashboard section displays a visible heading **"MY METRICS"** above the metrics rows. Use the appropriate `Header` typography component consistent with the design (bold, uppercase or as designed).

---

## Technical Notes

### Design Reference — Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ MY METRICS                                                      │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐       │
│ │ Wallet ?     │  │ Vault shares?│  │ Your share of    │       │
│ │ 0.52 🟡 rBTC │  │ 0.52 🟡 rBTC │  │ vault ?          │       │
│ │ $12,345 USD  │  │ $12,345 USD  │  │ 1%               │       │
│ └──────────────┘  └──────────────┘  └──────────────────┘       │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌───────┐│
│ │ Principal    │  │ Current      │  │ Total balance│ │Yield %││
│ │ deposited    │  │ earnings ?   │  │ ?            │ │to date││
│ │ 0.52 🟡 rBTC │  │ 1,240 🟡 rBTC│  │ 1,240.52     │ │?      ││
│ │ $12,345 USD  │  │              │  │ 🟡 rBTC      │ │20%    ││
│ └──────────────┘  └──────────────┘  │ 0 USD        │ └───────┘│
│                                     └──────────────┘           │
│ ↩ View history                          ↩ View yield history   │
│                                                                 │
│ [Deposit] [Withdraw]  Swap to/from RBTC ↗                      │
└─────────────────────────────────────────────────────────────────┘
```

### New Files to Create

| File | Type | Purpose |
|------|------|---------|
| `src/app/btc-vault/components/BtcVaultDashboard.tsx` | Client component | Container: wires `useUserPosition`, `useAccount`, determines states, renders section title, two rows of metrics, nav links, and actions slot. |
| `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` | Test | Component tests: connected/disconnected/loading/empty/has-position states. |
| `src/app/btc-vault/components/BtcVaultActions.tsx` | Client component | Renders Deposit/Withdraw buttons and Swap link. Uses `useActionEligibility` for conditional rendering. Click handlers are no-op props (F5/F6 wires them). |
| `src/app/btc-vault/components/index.ts` | Barrel export | Exports `BtcVaultDashboard`, `BtcVaultActions`. |

### Files to Modify

| File | Change |
|------|--------|
| `src/app/btc-vault/BtcVaultPage.tsx` | Import and render `BtcVaultDashboard` inside the F4 `<section>`, conditioned on `isConnected`. |
| `src/app/btc-vault/services/types.ts` | Add `totalDepositedPrincipal: bigint` to `UserPosition`. |
| `src/app/btc-vault/services/ui/types.ts` | Add new display fields: `totalDepositedPrincipalFormatted`, `currentEarningsFormatted`, `totalBalanceFormatted`, `yieldPercentToDateFormatted`, fiat fields, raw bigints. |
| `src/app/btc-vault/services/ui/mappers.ts` | Update `toUserPositionDisplay` with new mappings and derived calculations. |
| `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts` | Add `totalDepositedPrincipal` to mock data. |
| `src/app/btc-vault/services/ui/mappers.test.ts` | Update tests for new fields, derivations, edge cases. |

### Component Hierarchy

```
BtcVaultPage
└── <section data-testid="btc-vault-dashboard">
    └── BtcVaultDashboard                  ← new (client component, container)
        ├── Header "MY METRICS"            ← section title
        ├── MetricsContainer               ← shared (from src/components/containers)
        │   ├── Row 1 (flex row)
        │   │   ├── BalanceInfo "Wallet"
        │   │   ├── BalanceInfo "Vault shares"
        │   │   └── BalanceInfo "Your share of vault"
        │   ├── Row 2 (flex row)
        │   │   ├── BalanceInfo "Principal deposited"
        │   │   ├── BalanceInfo "Current earnings"
        │   │   ├── BalanceInfo "Total balance"
        │   │   └── BalanceInfo "Yield % to date"
        │   ├── Nav links row (conditional: has position)
        │   │   ├── "View history" link (left)
        │   │   └── "View yield history" link (right)
        │   └── BtcVaultActions            ← new (conditional: connected + eligible)
        │       ├── Deposit button
        │       ├── Withdraw button
        │       └── "Swap to/from RBTC" link
        └── (nothing when disconnected — entire section hidden)
```

### Data Flow

```
useAccount() → { address, isConnected }
    ↓
if !isConnected → render nothing (MY METRICS hidden)
    ↓
useUserPosition(address) → { data: UserPositionDisplay, isLoading, isError }
useActionEligibility(address) → { data: ActionEligibility }
    ↓
BtcVaultDashboard:
  if isLoading → BalanceInfo amount="..."
  else → BalanceInfo amount={data.rbtcBalanceFormatted} etc. (zeros for no position)
    ↓
BtcVaultActions:
  if canDeposit → show Deposit button (onClick = no-op)
  if canWithdraw → show Withdraw button (onClick = no-op)
  show "Swap to/from RBTC" link (when any button is shown)
```

### Empty Value Display Rules

| Condition | Wallet | Vault Shares | Share of Vault | Principal | Earnings | Total Balance | Yield % |
|-----------|--------|-------------|----------------|-----------|----------|---------------|---------|
| Disconnected | *(hidden — entire section not rendered)* |||||||
| Loading | ... | ... | ... | ... | ... | ... | ... |
| Connected, no position | *(actual)* | 0 rBTC | 0% | 0 rBTC | 0 rBTC | 0 rBTC | 0% |
| Connected, has position | *(actual)* | *(actual)* | *(actual)* | *(actual)* | *(derived)* | *(actual)* | *(derived)* |

**Fiat amounts for zero values:** Show `$0.00 USD` or `0.00 USD` as in the design.

### Fiat USD Amounts

The design shows USD fiat equivalents for these metrics: Wallet, Vault shares, Principal deposited, Total balance.

**For the mock data layer**, define a constant `MOCK_RBTC_USD_PRICE` (e.g., `23_750`) and compute fiat amounts in the mapper. When real contract data is wired (separate story), replace with a price feed hook.

**Format:** `$XX,XXX.XX USD` or `XX,XXX USD` matching the design's `$12,345 USD` / `0.00 USD` patterns.

### Testing Strategy

- **Unit tests (Vitest):** `toUserPositionDisplay` mapper — new fields, derived calculations (currentEarnings, yieldPercent), edge cases (zero principal, zero position), fiat formatting.
- **Component tests (Vitest + RTL):**
  - `BtcVaultDashboard` — connected/disconnected (hidden)/loading/empty/has-position states.
  - Assert section title "MY METRICS" is rendered.
  - Assert all 7 metrics rendered with correct `data-testid` and values.
  - Assert "View history" / "View yield history" links shown only when position exists.
  - Assert zeros (not dashes) for empty position.
  - Assert entire section hidden when disconnected.
- **`BtcVaultActions` component tests:** Verify button rendering based on eligibility, tooltip content for block reasons, no-op click handlers.
- **No E2E:** Display-only feature with mock data; E2E deferred until real contract integration.

### Coding Conventions Checklist

- [ ] Component files in PascalCase (`BtcVaultDashboard.tsx`, `BtcVaultActions.tsx`)
- [ ] `'use client'` directive on all new components (they use hooks)
- [ ] No default exports (feature components, not pages)
- [ ] Barrel exports from `src/app/btc-vault/components/index.ts`
- [ ] `BalanceInfo` className: `w-full md:w-[214px] md:min-w-[180px]` (mobile-first per `responsive-mobile-first.mdc`)
- [ ] Imports ordered: external → alias → relative
- [ ] JSDoc on exported components and hooks
- [ ] `data-testid` attributes on all testable elements
- [ ] No `any` without `// SAFETY:` comment
- [ ] Error variable named `error` in catch blocks
- [ ] Tooltip "?" icons use existing `tooltipContent` prop pattern on BalanceInfo

---

## Suggested Phases (Commit Strategy)

Split into **4 phases** (1-3 ACs each, one layer per phase, <5 source files). Boundaries are chosen so that `git blame` in 1 year answers "why does this exist?" without reading adjacent files.

### Phase 1: Data layer — types, mappers, mock data, tests

**Acceptance Criteria Covered:** AC-2, AC-8
**Layer:** data
**Commit:** `feat(btc-vault): extend position data layer with earnings and yield metrics`

**Scope:**
- Extend `UserPosition` with `totalDepositedPrincipal` field.
- Extend `UserPositionDisplay` with all new display fields (earnings, total balance, yield %, fiat amounts).
- Update `toUserPositionDisplay` mapper with derived calculations (currentEarnings, yieldPercent, totalBalance, fiat).
- Add `MOCK_RBTC_USD_PRICE` constant for fiat computation.
- Update `MOCK_POSITION` and `EMPTY_POSITION` in `useUserPosition`.
- Update mapper tests: new fields, derived values, edge cases (zero principal, zero position).

**Files touched:**
- `src/app/btc-vault/services/types.ts`
- `src/app/btc-vault/services/ui/types.ts`
- `src/app/btc-vault/services/ui/mappers.ts`
- `src/app/btc-vault/services/ui/mappers.test.ts`
- `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts`

**Why this boundary:** Pure TypeScript — no React, no components. When someone blames a type or mapper, this commit explains "these fields were added to support the MY METRICS investor dashboard."

---

### Phase 2: Dashboard skeleton — section title, metrics rows, page integration

**Acceptance Criteria Covered:** AC-1, AC-9, AC-10
**Layer:** UI
**Commit:** `feat(btc-vault): implement MY METRICS dashboard with metrics layout`

**Scope:**
- Create `BtcVaultDashboard.tsx` — section title "MY METRICS", mobile-first two-row layout (`flex flex-col gap-4 md:flex-row md:gap-x-6`) with 7 `BalanceInfo` cards, loading state (`"..."`), wired to `useUserPosition`.
- Create `BtcVaultDashboard.test.tsx` — connected with data, loading state tests.
- Wire `BtcVaultDashboard` into `BtcVaultPage.tsx` F4 section.

**Files touched:**
- `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(new)*
- `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` *(new)*
- `src/app/btc-vault/BtcVaultPage.tsx`

**Why this boundary:** The core layout. When someone asks "what renders MY METRICS?", blame lands on this commit with the full component structure and page wiring.

---

### Phase 3: Dashboard states — empty position, disconnected, current earnings

**Acceptance Criteria Covered:** AC-3, AC-4, AC-5
**Layer:** UI
**Commit:** `feat(btc-vault): add dashboard empty state and disconnected behavior`

**Scope:**
- Update `BtcVaultDashboard.tsx` — hide entirely when disconnected (`!isConnected → return null`), show zeros for empty position, current earnings tooltip.
- Update `BtcVaultDashboard.test.tsx` — disconnected (hidden), empty position (zeros not dashes), current earnings with tooltip.

**Files touched:**
- `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(modify)*
- `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` *(modify)*

**Why this boundary:** State handling is a distinct concern from layout. When someone asks "why does the dashboard disappear when I disconnect?", blame points to this commit. When QA reports zeros vs dashes, this is the commit to inspect.

---

### Phase 4: Actions + navigation links

**Acceptance Criteria Covered:** AC-6, AC-7
**Layer:** UI
**Commit:** `feat(btc-vault): add dashboard action buttons and navigation links`

**Scope:**
- Create `BtcVaultActions.tsx` — Deposit/Withdraw buttons with eligibility-based conditional rendering via `useActionEligibility`, block-reason tooltips, "Swap to/from RBTC" link. Click handlers are no-op callback props.
- Create `BtcVaultActions.test.tsx` — button visibility per eligibility state, tooltip content, no-op handlers.
- Add navigation links to `BtcVaultDashboard` — "View history" (left) and "View yield history" (right), conditionally shown when `vaultTokensRaw > 0n`.
- Create barrel export `src/app/btc-vault/components/index.ts`.

**Files touched:**
- `src/app/btc-vault/components/BtcVaultActions.tsx` *(new)*
- `src/app/btc-vault/components/BtcVaultActions.test.tsx` *(new)*
- `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(modify — add nav links + actions slot)*
- `src/app/btc-vault/components/index.ts` *(new)*

**Why this boundary:** Actions and navigation are a distinct concern from metric display. When F5/F6 wires up real deposit/withdraw flows, blame clearly shows the buttons were scaffolded here with no-op handlers. When someone asks "why is the Withdraw button hidden?", they find the eligibility logic in this commit.

---

## Out of Scope

- **Real contract data:** Hooks use mock data (`staleTime: Infinity`). Wiring to real multicall/adapter is a separate story.
- **Deposit/Withdraw modal flows:** Only the trigger buttons are included (no-op handlers). Full forms, review screens, and transaction flows are F5/F6.
- **Transaction history view:** Handled by F10 zone. "View history" link target may be a placeholder.
- **Vault-level metrics (TVL, APY, NAV):** Handled by F3 zone (Vault Metrics). This story only covers user-specific metrics.
- **KYB flow integration:** Beyond showing banners (already implemented in `BtcVaultBanners`).
- **Investments History chart:** Separate zone/story.
- **Capital Allocation Transparency:** Separate zone/story.
- **Real rBTC/USD price feed:** Mock price used for fiat amounts. Price feed hook is a separate story.
- **Swap to/from RBTC implementation:** Link rendered but target/behavior is out of scope.

---

## Design States Reference

The Figma design shows these investor states, all relevant to MY METRICS:

| State | MY METRICS visible? | Values | Actions shown | Nav links |
|-------|-------------------|--------|---------------|-----------|
| Wallet not connected | **No** (hidden entirely) | — | — | — |
| No KYB | Yes | Zeros | Hidden (not eligible) | No |
| KYB rejected | Yes | Zeros | Hidden (not eligible) | No |
| KYB approved, no activity | Yes | Zeros | Deposit + Withdraw + Swap | No |
| Request pending, no activity | Yes | Zeros (wallet has balance) | Deposit (with tooltip) + Withdraw + Swap | No |
| Request successful, no history | Yes | Actual values | Deposit + Withdraw + Swap | No (no yield history yet) |
| Active user | Yes | Actual values | Deposit + Withdraw + Swap | View history + View yield history |
| Deposits paused | Yes | Actual values | Withdraw + Swap | View history + View yield history |
| Withdrawals paused | Yes | Actual values | Deposit + Swap | View history + View yield history |
| All paused | Yes | Actual values | Swap only (or hidden) | View history + View yield history |

---

## Reference Files

| File | Why It Matters |
|------|---------------|
| `src/app/vault/components/VaultMetricsContainer.tsx` | Layout and MetricsContainer usage pattern to adapt |
| `src/app/vault/components/VaultUserMetricsContainer.tsx` | BalanceInfo usage, conditional rendering, loading state pattern |
| `src/components/BalanceInfo/BalanceInfo.tsx` | Shared display component — props interface (amount, symbol, title, tooltipContent, fiatAmount) |
| `src/components/containers/MetricsContainer.tsx` | Shared container with styling |
| `src/app/btc-vault/BtcVaultBanners.tsx` | Existing btc-vault banner pattern, uses useActionEligibility |
| `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts` | Hook to consume for user position data |
| `src/app/btc-vault/hooks/useVaultMetrics/useVaultMetrics.ts` | Hook to consume for NAV context |
| `src/app/btc-vault/hooks/useActionEligibility/useActionEligibility.ts` | Hook for deposit/withdraw eligibility + block reasons |
| `src/app/btc-vault/services/types.ts` | Domain types to extend |
| `src/app/btc-vault/services/ui/types.ts` | Display types to extend |
| `src/app/btc-vault/services/ui/mappers.ts` | Mapper to update with derived calculations |
| `src/app/btc-vault/services/ui/formatters.ts` | Formatter functions (formatPercent, formatApyPercent, etc.) |
