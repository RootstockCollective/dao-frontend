# STORY-BTC-DEPOSIT-002: Request Submission & Post-Submission UX

## Status
- [x] Draft
- [ ] Ready for Development
- [ ] In Architecture
- [ ] In Development
- [ ] In Review
- [ ] In QA
- [ ] Done

## Description

Wire the `requestDeposit()` contract call into the deposit form built in STORY-BTC-DEPOSIT-001, and implement the post-submission success state with appropriate messaging and CTAs. This completes the end-to-end deposit request flow for the BTC Vault.

**Why:** After the investor reviews their deposit details (STORY-BTC-DEPOSIT-001), they need to actually submit the request on-chain and receive clear confirmation that it was submitted successfully. The post-submission UX must reinforce that this is a *request* (not an instant deposit) and guide the user to track its status.

**Key differences from USDRIF vault:**
- Single tx: `requestDeposit()` (no ERC-20 approve step — rBTC is native currency)
- No asset transfer at this step (funds move after epoch close + FM approval)
- Post-submission status is "Pending" (not "Deposited")
- Success messaging emphasizes the request-based nature

## Acceptance Criteria

- [ ] AC-1: When the user clicks "Submit Request" on the review screen, the app calls `requestDeposit()` on the BTC Vault contract with the correct parameters (amount in Wei, slippage-derived min shares). The transaction is managed through `executeTxFlow` with a new `btcVaultDepositRequest` action type and appropriate pending/success/error toast messages.
- [ ] AC-2: While the transaction is pending, the submit button shows a loading/pending state and is disabled. If the user rejects the wallet popup, the flow returns to the review screen silently (no error toast).
- [ ] AC-3: On successful transaction confirmation, the deposit modal closes and a success state is displayed showing: "Deposit request submitted", "Pending Fund Manager approval", and two CTAs: "View request status" and "Go to My Position".
- [ ] AC-4: After successful submission, relevant queries are invalidated so the active requests list and eligibility state refresh (the deposit button should become disabled with "You already have an active request" tooltip).
- [ ] AC-5: If the transaction fails (non-user-rejection), an error toast is shown with the error message, the modal remains open on the review screen, and the user can retry.

## Technical Notes

- **Contract call:** `requestDeposit()` on `BTC_VAULT_ADDRESS` — ABI needs to be added/verified. rBTC is sent as `msg.value` (native currency), not as an ERC-20 transfer.
- **executeTxFlow integration:** Add `btcVaultDepositRequest` to `TX_MESSAGES` in `src/shared/txMessages.ts` with pending/success/error messages specific to the request-based flow.
- **Query invalidation:** After success, invalidate `['btc-vault', 'active-requests', address]` and `['btc-vault', 'action-eligibility', address]` query keys.
- **Hook:** Create `useSubmitDepositRequest` hook (or similar) under `src/app/btc-vault/hooks/` that wraps the contract write call. Use `useContractWrite` pattern from `src/app/user/Stake/hooks/useContractWrite.ts`.
- **Success state:** Can be implemented as a toast + redirect, or as a brief inline success view before auto-closing the modal — follow whichever pattern the USDRIF vault uses for post-deposit UX.
- **"View request status" CTA:** Scrolls to or navigates to the active request queue section on the BTC Vault page.
- **"Go to My Position" CTA:** Scrolls to or navigates to the user position/dashboard section.

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
- File: `../plans/STORY-BTC-DEPOSIT-002-plan.md`
- Status: [ ] Pending | [ ] Approved | [ ] Rejected

### Code Review
- PR: #[number]
- File: `../reviews/STORY-BTC-DEPOSIT-002-review.md`
- Status: [ ] Pending | [ ] Approved | [ ] Changes Requested

### QA Report
- File: `../qa-reports/STORY-BTC-DEPOSIT-002-qa.md`
- Status: [ ] Pending | [ ] Passed | [ ] Failed
