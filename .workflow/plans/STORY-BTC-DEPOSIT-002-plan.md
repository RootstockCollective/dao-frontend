# Architecture Plan: STORY-BTC-DEPOSIT-002

## Request Submission & Post-Submission UX

**Story:** STORY-BTC-DEPOSIT-002
**Author:** Architect Agent
**Date:** 2026-03-03
**Status:** Pending Approval

---

## 1. Summary

Wire the `requestDeposit()` contract call into the deposit modal built in STORY-001, add transaction lifecycle management via `executeTxFlow`, implement post-submission success state with appropriate messaging and CTAs, and ensure query invalidation refreshes the UI state. This is a focused integration story — no new form UI, just the contract call, tx orchestration, and post-success UX.

### Key Decisions
- **Single transaction** — `requestDeposit()` sends rBTC as `msg.value` (native currency), no ERC-20 approve step needed
- **executeTxFlow orchestration** — reuse the existing tx lifecycle pattern with a new `btcVaultDepositRequest` action in TX_MESSAGES
- **Success state as toast + callback** — follow USDRIF pattern: modal closes on success, toast shows confirmation, parent component can show inline success or scroll to request queue
- **useSubmitDepositRequest hook** — wraps contract write with `useContractWrite` pattern, composes with executeTxFlow in the parent

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | Submit calls `requestDeposit()` with correct params, managed via executeTxFlow with new action type | `useSubmitDepositRequest` hook + executeTxFlow with `btcVaultDepositRequest` action |
| AC-2 | Loading state on submit button; silent return on wallet rejection | `isSubmitting` state from hook drives button state; executeTxFlow already handles user rejection silently |
| AC-3 | Success: modal closes, shows "Deposit request submitted" / "Pending FM approval" + CTAs | onSuccess callback closes modal; success toast via TX_MESSAGES; parent shows inline success or navigates |
| AC-4 | Query invalidation refreshes active requests and eligibility | Invalidate `['btc-vault', 'active-requests', address]` and `['btc-vault', 'action-eligibility', address]` on success |
| AC-5 | Error toast on failure; modal stays open on review screen for retry | executeTxFlow error handling already shows toast; modal state preserved (no step reset on error) |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/lib/abis/BtcVaultAbi.ts` | Create | ABI fragment for `requestDeposit` function |
| `src/app/btc-vault/hooks/useSubmitDepositRequest.ts` | Create | Hook wrapping `requestDeposit()` contract call via useContractWrite |
| `src/app/btc-vault/hooks/useSubmitDepositRequest.test.ts` | Create | Tests for hook |
| `src/shared/txMessages.ts` | Modify | Add `btcVaultDepositRequest` action messages |
| `src/app/btc-vault/components/BtcVaultActions.tsx` | Modify | Wire useSubmitDepositRequest + executeTxFlow into modal's onSubmit |
| `src/app/btc-vault/components/BtcVaultActions.test.tsx` | Modify | Add submission flow tests |

---

## 4. Architecture Decisions

### 4.1 Native rBTC via msg.value

**Decision:** The `requestDeposit()` call sends rBTC as `msg.value` using wagmi's `value` parameter in the contract write config, not as an ERC-20 transfer.

**Rationale:** rBTC is the native currency on Rootstock. Unlike USDRIF (ERC-20 requiring approve+deposit), there's no token approval step. The wagmi `useWriteContract` hook supports a `value` field for native currency transfers.

### 4.2 Hook Composition in BtcVaultActions

**Decision:** `BtcVaultActions` composes `useSubmitDepositRequest` with `executeTxFlow` to create the `handleSubmit` function passed to the modal's `onSubmit` prop.

**Rationale:** Keeps the modal (STORY-001) pure — it only knows about form data and callbacks. The parent handles contract calls, tx lifecycle, toasts, and query invalidation. This matches how the USDRIF vault's page-level code composes hooks with the modal.

### 4.3 Query Invalidation Strategy

**Decision:** On successful transaction confirmation, invalidate both `['btc-vault', 'active-requests', address]` and `['btc-vault', 'action-eligibility', address]` query keys via `queryClient.invalidateQueries()`.

**Rationale:** After a deposit request is submitted, the user now has an active request (which should appear in the queue) and should no longer be eligible to submit another deposit (active request guard). Invalidating these two queries triggers automatic refetch.

### 4.4 Success UX Pattern

**Decision:** Follow the USDRIF vault pattern — modal closes on success, toast notification shows confirmation. Additionally, add a brief inline success banner in the actions section showing "Deposit request submitted" with CTAs.

**Rationale:** The epic specifically requires CTAs ("View request status", "Go to My Position") which need a surface to render. A toast alone can't contain interactive CTAs well. A brief inline success state in `BtcVaultActions` (auto-dismissing after ~10s or on user interaction) provides the CTAs naturally.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA

### Phase 1: Contract Hook & TX Messages

**Acceptance Criteria Covered:** AC-1, AC-2, AC-5

**Files to Create/Modify:**
- [ ] `src/lib/abis/BtcVaultAbi.ts` — ABI fragment for `requestDeposit`
- [ ] `src/app/btc-vault/hooks/useSubmitDepositRequest.ts` — Hook for contract call
- [ ] `src/app/btc-vault/hooks/useSubmitDepositRequest.test.ts` — Hook tests
- [ ] `src/shared/txMessages.ts` — Add `btcVaultDepositRequest` messages

**Implementation Steps:**

- [ ] **Step 1.1:** Create BTC Vault ABI fragment
  - Create `src/lib/abis/BtcVaultAbi.ts` with the `requestDeposit` function ABI
  - The exact ABI signature needs to be verified against the deployed contract. Likely signature: `requestDeposit(uint256 assets, address receiver, uint256 minShares)` — but this must be confirmed.
  - If ABI is not yet available: create a placeholder with the expected signature and mark with a TODO. The hook structure won't change regardless of exact params.

- [ ] **Step 1.2:** Create `useSubmitDepositRequest` hook
  - Uses `useContractWrite` pattern from `src/app/user/Stake/hooks/useContractWrite.ts`
  - Config:
    - `abi`: BtcVaultAbi
    - `address`: `BTC_VAULT_ADDRESS`
    - `functionName`: `'requestDeposit'`
    - `args`: `[amount, receiver, minSharesOut]` (computed from DepositRequestParams)
    - `value`: amount (rBTC sent as msg.value)
  - Accept `amount: bigint` and `slippage: number` as parameters
  - Calculate `minSharesOut` using `calculateMinSharesOut` from slippage utils
  - Return: `{ onRequestDeposit, isRequesting, isTxPending, isTxFailed, txHash }`

- [ ] **Step 1.3:** Add TX_MESSAGES for `btcVaultDepositRequest`
  - In `src/shared/txMessages.ts`, add:
    ```
    btcVaultDepositRequest: {
      pending: { title: "Deposit request in process", content: "Waiting for transaction confirmation...", severity: "info", loading: true }
      success: { title: "Deposit request submitted", content: "Your deposit request is pending Fund Manager approval.", severity: "success", loading: false }
      error: { title: "Deposit request failed", content: "...", severity: "error", loading: false }
    }
    ```

**Tests to Write:**
- [ ] `useSubmitDepositRequest.test.ts`: Hook initializes with correct contract config; `onRequestDeposit` is callable; status flags default correctly. (Contract call itself will be mocked — testing the hook's composition logic, not the actual blockchain interaction.)

---

### Phase 2: Submission Wiring, Success State & Query Invalidation

**Acceptance Criteria Covered:** AC-2, AC-3, AC-4, AC-5

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/BtcVaultActions.tsx` — Wire submission + success state
- [ ] `src/app/btc-vault/components/BtcVaultActions.test.tsx` — Submission flow tests

**Implementation Steps:**

- [ ] **Step 2.1:** Wire `useSubmitDepositRequest` into `BtcVaultActions`
  - Import `useSubmitDepositRequest` and `executeTxFlow`
  - Create `handleSubmit` async function:
    1. Call `executeTxFlow({ action: 'btcVaultDepositRequest', onRequestTx: onRequestDeposit, onSuccess: handleSuccess, onError: handleError })`
  - Pass `handleSubmit` as `onSubmit` to `BtcDepositModal`
  - Pass `isRequesting || isTxPending` as `isSubmitting` to modal

- [ ] **Step 2.2:** Implement success handler with query invalidation
  - `handleSuccess`:
    1. Close the modal (`setIsModalOpen(false)`)
    2. Invalidate queries:
       ```
       queryClient.invalidateQueries({ queryKey: ['btc-vault', 'active-requests', address] })
       queryClient.invalidateQueries({ queryKey: ['btc-vault', 'action-eligibility', address] })
       ```
    3. Set `showSuccessBanner(true)` — brief inline success state

- [ ] **Step 2.3:** Implement inline success banner in `BtcVaultActions`
  - State: `successBannerVisible: boolean`
  - When visible, render below the Deposit button:
    - Text: "Deposit request submitted" / "Pending Fund Manager approval"
    - CTA: "View request status" — scrolls to `[data-testid="btc-vault-request-queue"]`
    - CTA: "Go to My Position" — scrolls to `[data-testid="btc-vault-dashboard"]`
    - Auto-dismiss after 10 seconds or on any CTA click
  - When modal is open, hide the success banner

- [ ] **Step 2.4:** Handle error state
  - `executeTxFlow` already shows error toasts and silently handles user rejection
  - On non-user error: modal stays open on review screen (no step reset needed — modal state is preserved)
  - Optional: set `isTxFailed` → show retry hint in modal

**Tests to Write:**
- [ ] `BtcVaultActions.test.tsx` (additions):
  - Clicking Submit in modal triggers executeTxFlow (mock executeTxFlow, verify it's called with correct action)
  - On success: modal closes, success banner appears with correct text and CTAs
  - On error: modal stays open (verify isModalOpen remains true)
  - Query invalidation: verify queryClient.invalidateQueries called with correct keys
  - Success banner auto-dismisses (use fake timers)

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | Hook composition, contract config, TX message structure | `useSubmitDepositRequest.test.ts` |
| Phase 2 | Unit + Component (Vitest + RTL) | Submission flow, success/error states, query invalidation, CTA behavior | `BtcVaultActions.test.tsx` |

### Testing Approach
- Mock `useContractWrite` to avoid actual contract calls — test that the hook composes correctly
- Mock `executeTxFlow` in component tests — verify it's called with correct params and test callback behavior
- Mock `useQueryClient` to verify invalidation calls
- Use `vi.useFakeTimers()` for success banner auto-dismiss test
- Test user rejection path: executeTxFlow resolves without calling onSuccess or onError

### Coverage Targets
- `useSubmitDepositRequest.ts` — 80%+ (hook logic)
- `BtcVaultActions.tsx` — 80%+ (integration logic)
- `BtcVaultAbi.ts` — N/A (constant)
- `txMessages.ts` changes — N/A (constant)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `requestDeposit()` ABI not finalized / differs from expected signature | Medium | High | Create ABI with expected signature + TODO comment. Hook structure is flexible — only the args array changes if signature differs. Verify against deployed contract before merging. |
| rBTC `msg.value` handling differs from standard ERC-20 pattern in `useContractWrite` | Low | Medium | wagmi's `useWriteContract` natively supports `value` for native currency. Verify in the hook that the `value` field is passed correctly. |
| Query invalidation timing — stale mock data won't reflect new request | Low | Low | Current hooks use mock data with `staleTime: Infinity`. After invalidation, mocks will just refetch the same data. Real integration testing requires live contract. Acceptable for MVP. |
| Success banner may conflict with future request queue display | Low | Low | Banner is a temporary overlay, auto-dismissing. When queue display is implemented, the submitted request will appear there naturally. Banner can be removed or simplified. |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
