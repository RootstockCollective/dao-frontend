# STORY-BTC-DEPOSIT-001: Deposit Form & Review Screen for BTC Vault

## Status
- [x] Draft
- [ ] Ready for Development
- [ ] In Architecture
- [ ] In Development
- [ ] In Review
- [ ] In QA
- [ ] Done

## Description

Build the investor-facing deposit form and review screen for the BTC Vault. This covers the full UI from the deposit action button through amount input, slippage configuration, and a review step with all required disclosures — but stops short of the actual `requestDeposit()` contract call (covered in STORY-BTC-DEPOSIT-002).

The BTC Vault uses a request-based, epoch-driven model: deposits are requests that require Fund Manager approval, not instant transfers. The UI must make this explicit through disclosures and a dedicated review step before submission.

**Why:** Investors need a clear, transparent deposit flow that communicates the request-based nature of the BTC Vault. Unlike the USDRIF Vault's instant deposit, this flow requires additional disclosures and a review step to set correct expectations about timing, pricing, and finality.

**Existing foundation:**
- `BtcVaultPage.tsx` has an empty `btc-vault-actions` placeholder section
- `useActionEligibility` hook already returns `canDeposit` / `depositBlockReason`
- `useActiveRequests` hook tracks active requests
- `useVaultMetrics` / `useEpochState` hooks provide NAV, fees, and epoch data
- Display types and mappers exist in `services/ui/`

**Key reference:** Adapt patterns from `src/app/vault/components/DepositModal.tsx` (USDRIF vault), but replace the two-step ERC-20 approve+deposit pattern with a single-step review+submit flow (no token approval needed for rBTC).

## Acceptance Criteria

- [ ] AC-1: A "Deposit" button appears in the BTC Vault actions section. It is enabled only when `useActionEligibility` returns `canDeposit: true`. When disabled, a tooltip shows the `depositBlockReason` (e.g., "You already have an active request", "Deposits are currently paused", or the eligibility reason).
- [ ] AC-2: Clicking the enabled Deposit button opens a modal with an amount input for rBTC. The input shows the user's wallet rBTC balance (from `useUserPosition`) and provides percentage buttons (25%, 50%, 75%, 100%). Validation prevents submitting an amount that exceeds the wallet balance or is zero/empty.
- [ ] AC-3: The modal includes a slippage configuration input (reuse/adapt `SlippageInput` from the USDRIF vault). Default slippage is loaded from `VAULT_DEFAULT_SLIPPAGE_PERCENTAGE`.
- [ ] AC-4: After entering a valid amount, a review step displays: deposit amount (rBTC), estimated vault shares (calculated from last confirmed NAV), last confirmed NAV with timestamp, deposit fee (% — show "0%" if none), selected slippage tolerance, and the three disclosures: "This is a request and requires approval", "Shares are minted at the NAV confirmed at epoch close", "Once the epoch is closed, deposit requests cannot be canceled".
- [ ] AC-5: The review step has a "Submit Request" button (initially wired to a no-op or callback prop — actual contract call is STORY-BTC-DEPOSIT-002) and a "Back" button to return to the amount input step.

## Technical Notes

- **Adapt, don't copy** the USDRIF `DepositModal` — remove ERC-20 approval flow, remove `depositWithSlippage` references, add review step with disclosures
- Reuse existing shared components: `Modal`, `PercentageButtons`, `Input`, `SlippageInput`
- Reuse slippage math from `src/app/vault/utils/slippage.ts` (`calculateMinSharesOut`, `DEFAULT_SLIPPAGE_PERCENTAGE`)
- Estimated shares calculation: `amount / navPerShare` (using last confirmed NAV from `useVaultMetrics`)
- Deposit fee: source from vault metrics or contract (if not available, show "0%")
- The modal should accept an `onSubmit(params: DepositRequestParams)` callback prop so STORY-BTC-DEPOSIT-002 can wire the contract call without modifying the form component
- All new components go under `src/app/btc-vault/components/`
- Feature-flagged behind existing `btc_vault` flag (already applied at page level)

## Priority

- [ ] Critical
- [x] High
- [ ] Medium
- [ ] Low

## Estimated Size

- [ ] S (< 1 day)
- [x] M (1-3 days)
- [ ] L (3-5 days)
- [ ] XL (> 5 days)

---

## Workflow Artifacts

### Architecture Plan
- File: `../plans/STORY-BTC-DEPOSIT-001-plan.md`
- Status: [ ] Pending | [ ] Approved | [ ] Rejected

### Code Review
- PR: #[number]
- File: `../reviews/STORY-BTC-DEPOSIT-001-review.md`
- Status: [ ] Pending | [ ] Approved | [ ] Changes Requested

### QA Report
- File: `../qa-reports/STORY-BTC-DEPOSIT-001-qa.md`
- Status: [ ] Pending | [ ] Passed | [ ] Failed
