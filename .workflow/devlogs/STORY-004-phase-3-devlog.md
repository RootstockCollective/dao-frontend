# Devlog: STORY-004 — Phase 3

**Date:** 2025-03-19
**Phase:** 3 of 4
**Developer:** Developer Agent

---

## What Was Planned

Phase 3: Combined card and BtcVaultBanners integration. (1) Extract deposit window inner content from DepositWindowBanner into a reusable component (e.g. DepositWindowSection) so BtcVaultEligibilityAndDepositCard can render it inside one gradient card. (2) Create BtcVaultEligibilityAndDepositCard: client component using useKybStatus and useEpochState; single gradient container; when status !== 'passed' render EligibilityBannerContent; when epoch open render DepositWindowSection; hide card when KYB passed and epoch closed. (3) In BtcVaultBanners: when connected and not contract-blocked, render BtcVaultEligibilityAndDepositCard instead of only DepositWindowBanner. (4) Update BtcVaultBanners.test.tsx: mock useKybStatus; tests for kyb none/rejected (eligibility visible), kyb passed (eligibility not present, deposit window when epoch open); update existing tests to mock useKybStatus.

## What Was Done

- **Step 3.1 — DepositWindowSection**
  - Created `src/app/btc-vault/components/DepositWindowSection.tsx`: presentational component accepting `epoch: EpochDisplay`. Renders header "DEPOSIT WINDOW {epochId}", subtitle, and Countdown. Includes internal `useState` + `useEffect` tick (COUNTDOWN_TICK_MS) so countdown updates when used standalone or inside the card. `data-testid="deposit-window-section"`.
  - Updated `DepositWindowBanner.tsx`: uses `useEpochState()`, same guard (`!epoch?.isAcceptingRequests || epoch?.endTime == null` → null), then renders `<StackableBanner><DepositWindowSection epoch={epoch} /></StackableBanner>`. DepositWindowBanner remains the standalone entry point with its own StackableBanner.

- **Step 3.2 — BtcVaultEligibilityAndDepositCard**
  - Created `src/app/btc-vault/components/BtcVaultEligibilityAndDepositCard.tsx`: client component using `useKybStatus()` and `useEpochState()`. Single `StackableBanner` with `background="linear-gradient(to right, #FAF9E3, #2D567E)"` and `testId="btc-vault-eligibility-and-deposit-card"`. When `status !== 'passed'` renders `EligibilityBannerContent` with variant `none` or `rejected`, `rejectionReason` from hook, `onSubmitKyb` and `onCheckStatus` no-ops. When `epoch?.isAcceptingRequests && epoch?.endTime != null` renders `DepositWindowSection` with epoch. Uses StackableBanner’s built-in divide-y between children. Returns `null` when both eligibility and deposit window are hidden (KYB passed + epoch closed).

- **Step 3.3 — BtcVaultBanners**
  - Replaced the branch that returned `<DepositWindowBanner />` when connected + eligible with `<BtcVaultEligibilityAndDepositCard />` for all connected + eligible cases. Removed `useEpochState` from BtcVaultBanners (epoch is read inside the card). Order unchanged: !connected → DisclosureBanner; contract block → NotAuthorizedBanner; connected + eligible → BtcVaultEligibilityAndDepositCard.

- **Step 3.4 — BtcVaultBanners.test.tsx**
  - Added `mockUseKybStatus` and `vi.mock('./hooks/useKybStatus', () => ({ useKybStatus: () => mockUseKybStatus() }))`. Default in `beforeEach`: `{ status: 'passed' }`.
  - Mocked `@/components/Countdown/Countdown` so the card’s DepositWindowSection does not require wagmi in tests.
  - Removed mock of `DepositWindowBanner` (no longer rendered from BtcVaultBanners).
  - Updated test "does not render … when wallet is connected and eligible but epoch is closed": now asserts no `btc-vault-eligibility-and-deposit-card` (card returns null when KYB passed and epoch closed).
  - Updated test "renders DepositWindowBanner when … epoch is open": renamed to "renders combined card with deposit window when … KYB passed, and epoch is open"; asserts `btc-vault-eligibility-and-deposit-card`, `deposit-window-section`, "DEPOSIT WINDOW 2", and no `eligibility-banner-content`.
  - New tests: "shows eligibility section when KYB status is none" (eligibility-banner-content, "Submit KYB", "ELIGIBILITY"); "shows eligibility section with Re-submit KYB when KYB status is rejected" (eligibility-banner-rejected-icon, "Re-submit KYB"); "shows both eligibility and deposit window when KYB is none and epoch is open".

- **useKybStatus null-safety**
  - In `useKybStatus.ts`, guarded `useSearchParams()`: `param = searchParams == null ? null : searchParams.get('kyb')` so tests or environments where searchParams is null (e.g. outside Next router) do not throw.

- **BtcVaultPage.test.tsx**
  - Replaced mock of `DepositWindowBanner` with mock of `BtcVaultEligibilityAndDepositCard` (returns a div with `data-testid="btc-vault-eligibility-and-deposit-card"`) so page tests do not render the real card (which would mount Countdown and wagmi’s useBlockNumber).

## Deviations from Plan

| Deviation | Reason | Impact |
| --------- |--------|--------|
| useKybStatus handles null `useSearchParams()` | BtcVaultPage and other tests render components that use the card or hook without Next router; `searchParams.get('kyb')` threw. | Hook safe in test and non-page contexts. |
| BtcVaultPage.test mocks BtcVaultEligibilityAndDepositCard | Page test does not provide WagmiProvider; real card would render Countdown → useBlockNumber → useConfig and fail. | Page tests remain focused on layout; card behavior covered in BtcVaultBanners.test. |

## Discoveries

- StackableBanner already accepts `children` as array or single node and applies divide-y between children; no extra wrapper needed.
- DepositWindowBanner.test.tsx did not need changes; it still mocks useEpochState and renders the real DepositWindowBanner, which now composes DepositWindowSection and mocked Countdown.

## Plan Amendments

None.

## Notes for Code Review

- DepositWindowSection lives in its own file; DepositWindowBanner and BtcVaultEligibilityAndDepositCard both use it. No duplicate JSX.
- When KYB passed and epoch closed, the card returns `null` (no empty box).
- All new testids are kebab-case: `btc-vault-eligibility-and-deposit-card`, `deposit-window-section`; eligibility section uses existing `eligibility-banner-content`, `eligibility-banner-submit-kyb`, etc.
