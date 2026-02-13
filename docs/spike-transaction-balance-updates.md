# Spike: Transaction Balance Update Improvements

## Overview

This document presents my findings and recommendations for improving balance update responsiveness after staking and unstaking operations. Users currently experience a noticeable delay before the UI reflects new balances, which differs from the near-instant updates they observe in their wallet.

---

## Executive Summary

**Root Cause:** Staking, unstaking, and swap flows do not trigger balance refresh after transaction completion. Balances only update via 60-second polling intervals.

**Recommended Fix:** Add explicit `refetchBalances()` calls to the `onSuccess` callback of affected flows, matching the pattern already used in vault operations.

**Impact:** Balance updates will appear within 1-2 seconds of transaction confirmation instead of up to 60 seconds.

**Effort:** 2-4 hours for implementation and testing.

---

## Investigation Findings

### Current Transaction Flows Audit

I reviewed all transaction flows in the dApp that use `executeTxFlow`. Here's what I found:

| Flow | File | `onSuccess` Behavior | Refreshes Data |
|------|------|---------------------|----------------|
| Staking | `Steps/StepThree.tsx` | `onCloseModal` | ❌ No |
| Unstaking | `UnstakeModal.tsx` | `onCloseModal` | ❌ No |
| Swap | `Steps/SwapStepThree.tsx` | `onCloseModal` | ❌ No |
| Vault Deposit | `DepositModal.tsx` | `onTransactionSuccess?.()` + `onCloseModal()` | ✅ Yes |
| Vault Withdraw | `WithdrawModal.tsx` | `onTransactionSuccess?.()` + `onCloseModal()` | ✅ Yes |
| Delegation | `ConnectedSection.tsx` | `refetch()` | ✅ Yes |
| Reclaim | `ConnectedSection.tsx` | `refetch()` | ✅ Yes |

### Why Vault Flows Work Correctly

The vault implementation in `VaultActions.tsx` demonstrates the correct pattern:

```typescript
const { refetch: refetchVaultBalance } = useVaultBalance()
const { refetchBalances } = useGetAddressBalances()

const handleRefreshBalances = useCallback(() => {
  refetchVaultBalance()
  refetchBalances()
}, [refetchVaultBalance, refetchBalances])

// Passed to modals
<DepositModal onTransactionSuccess={handleRefreshBalances} />
<WithdrawModal onTransactionSuccess={handleRefreshBalances} />
```

The deposit and withdraw modals then call `onTransactionSuccess?.()` in their `onSuccess` callback, triggering the balance refresh.

### Why Staking/Unstaking Flows Are Delayed

The staking flow in `StepThree.tsx`:

```typescript
executeTxFlow({
  onRequestTx: onRequestStake,
  onSuccess: onCloseModal,  // Only closes modal, no refresh
  action: 'staking',
})
```

The unstaking flow in `UnstakeModal.tsx`:

```typescript
executeTxFlow({
  onRequestTx: onRequestUnstake,
  onSuccess: onCloseModal,  // Only closes modal, no refresh
  action: 'unstaking',
})
```

Without explicit refresh, balances only update when the 60-second polling interval triggers, defined by `AVERAGE_BLOCKTIME` in `useGetAddressTokens.ts`.

### Existing Infrastructure

The good news is that all necessary infrastructure already exists:

1. **`useGetAddressBalances`** exposes `refetchBalances()` function
2. **`useGetAddressTokens`** combines `refetchRbtc()` and `refetchContracts()` 
3. **`BalancesContext`** provides access to refetch throughout the app
4. **`executeTxFlow`** supports `onSuccess` callbacks that can trigger any action

No new infrastructure is needed—we just need to use what exists.

---

## Recommendations

### Phase 1: Fix Affected Flows (Priority: Critical)

Add `refetchBalances()` to the three broken flows.

#### 1.1 Staking Flow

**File:** `src/app/user/Stake/Steps/StepThree.tsx`

```typescript
// Add import
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'

// Inside component
const { refetchBalances } = useGetAddressBalances()

// Update executeTxFlow call
executeTxFlow({
  onRequestTx: onRequestStake,
  onSuccess: () => {
    refetchBalances()
    onCloseModal()
  },
  action: 'staking',
})
```

#### 1.2 Unstaking Flow

**File:** `src/app/user/Unstake/UnstakeModal.tsx`

The component already imports `useBalancesContext`, which provides access to `refetchBalances`:

```typescript
// Update to destructure refetchBalances
const { balances, prices, refetchBalances } = useBalancesContext()

// Update handleConfirmUnstake
const handleConfirmUnstake = useCallback(() => {
  executeTxFlow({
    onRequestTx: onRequestUnstake,
    onSuccess: () => {
      refetchBalances()
      onCloseModal()
    },
    action: 'unstaking',
  })
}, [onRequestUnstake, onCloseModal, refetchBalances])
```

#### 1.3 Swap Flow

**File:** `src/app/user/Swap/Steps/SwapStepThree.tsx`

```typescript
// Add import
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'

// Inside component
const { refetchBalances } = useGetAddressBalances()

// Update executeTxFlow call
void executeTxFlow({
  onRequestTx: async () => {
    const txHash = await execute(amountOutMinimum)
    if (!txHash) {
      throw new Error('Transaction hash is null')
    }
    return txHash as Hash
  },
  onSuccess: () => {
    refetchBalances()
    onCloseModal()
  },
  action: 'swap',
})
```

#### Acceptance Criteria

- [ ] After staking, RIF and stRIF balances update within 2 seconds
- [ ] After unstaking, stRIF and RIF balances update within 2 seconds
- [ ] After swap, token balances update within 2 seconds
- [ ] Vault deposit/withdraw behavior remains unchanged
- [ ] No console errors or failed refetch calls

---

### Phase 2: Establish Coding Standard (Priority: High)

To prevent similar issues in future features, I recommend documenting the expected pattern.

#### Transaction Success Callback Rules

**For balance-affecting transactions (staking, unstaking, swap, vault operations):**

```typescript
onSuccess: () => {
  refetchBalances()  // Always refresh affected data first
  onCloseModal()     // Then close modal/navigate
}
```

**For state-affecting transactions (delegation, voting):**

```typescript
onSuccess: () => {
  refetch()  // Refresh relevant context/query
  // Additional cleanup
}
```

**For approval transactions (allowance):**

```typescript
onSuccess: () => {
  onGoNext()  // Proceed to next step (allowance hooks auto-refetch)
}
```

#### Code Review Checklist

When reviewing PRs with transactions:

- [ ] Uses `executeTxFlow` for consistent toast notifications
- [ ] `onSuccess` callback refreshes relevant data before closing modal
- [ ] `action` type is defined in `TX_MESSAGES`
- [ ] Loading and error states are handled

---

### Phase 3: Consider RPC State Lag (Priority: Medium)

During my research, I identified a potential edge case: some RPC providers have eventual consistency, where state updates can lag behind transaction receipts.

#### Recommendation

If testing reveals inconsistent balance updates, add a small delay before refetching:

```typescript
onSuccess: async () => {
  await new Promise(resolve => setTimeout(resolve, 500))
  await refetchBalances()
  onCloseModal()
}
```

This should only be implemented if we observe issues during testing—not preemptively.

---

### Phase 4: Future Improvements (Priority: Low)

These are optional enhancements to consider after Phase 1-2 are complete:

#### 4.1 Reduce Polling Interval

Current: `AVERAGE_BLOCKTIME = 60_000` (60 seconds)

Rootstock has ~30 second block times, so 60 seconds means balances for external transfers (someone sends you tokens) take up to 2 blocks to appear. Consider reducing to 30 seconds if RPC costs allow.

**Note:** This is separate from the post-transaction update issue. If explicit refetch works correctly, polling interval only affects external balance changes.

#### 4.2 Block-Based Invalidation

For real-time balance updates without polling:

```typescript
import { useBlockNumber } from 'wagmi'

const { data: blockNumber } = useBlockNumber({ watch: true })

useEffect(() => {
  if (blockNumber) {
    refetchBalances()
  }
}, [blockNumber])
```

**Trade-off:** More RPC calls. Only implement if users report issues with external transfers not appearing.

#### 4.3 Optimistic Updates

For staking specifically, the RIF→stRIF conversion is 1:1 (verified in `depositAndDelegate` function). We could show the expected balance immediately:

```typescript
// Before transaction
setOptimisticBalance({
  RIF: currentRIF - amount,
  stRIF: currentStRIF + amount,
})

// On success
refetchBalances()  // Reconcile with actual

// On error
rollbackOptimisticBalance()
```

**Trade-off:** Added complexity. The explicit refetch approach provides near-instant updates without rollback logic.

---

## What Already Works Well

I want to highlight patterns in the codebase that are implemented correctly:

1. **`executeTxFlow` utility** - Provides consistent transaction lifecycle management with toast notifications
2. **Vault operations** - Demonstrate the correct refresh pattern
3. **Delegation flow** - Properly refreshes context after transactions
4. **Toast notifications** - Already show pending, success, and error states
5. **Button loading states** - "Requesting...", "In progress" states are implemented
6. **Transaction status component** - Shows explorer links and failure messages

The infrastructure is solid. We just need to use it consistently.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Refetch fails silently | Low | Medium | Add error handling in refetch calls |
| RPC state lag causes stale read | Low | Low | Add delay if observed in testing |
| Multiple rapid transactions cause flickering | Low | Low | Transactions are serialized by wallet |
| Breaking existing vault behavior | Very Low | High | Vault code remains unchanged |

---

## Implementation Plan

| Task | Effort | Priority |
|------|--------|----------|
| Add refetch to staking flow | 30 min | P0 |
| Add refetch to unstaking flow | 30 min | P0 |
| Add refetch to swap flow | 30 min | P0 |
| Test all three flows on testnet | 1 hour | P0 |
| Update internal documentation | 1 hour | P1 |
| Monitor production for issues | Ongoing | P1 |

**Total estimated effort:** 2-4 hours

---

## Conclusion

The balance update delay is caused by a missing `refetchBalances()` call in three transaction flows. The fix is straightforward, low-risk, and uses existing infrastructure. I recommend implementing Phase 1 immediately, documenting the pattern in Phase 2, and deferring Phase 3-4 until we have production feedback.

---

## Appendix: Files Reference

### Files Requiring Changes

| File | Change |
|------|--------|
| `src/app/user/Stake/Steps/StepThree.tsx` | Add `refetchBalances()` to `onSuccess` |
| `src/app/user/Unstake/UnstakeModal.tsx` | Add `refetchBalances()` to `onSuccess` |
| `src/app/user/Swap/Steps/SwapStepThree.tsx` | Add `refetchBalances()` to `onSuccess` |

### Reference Implementation

| File | Pattern to Follow |
|------|-------------------|
| `src/app/vault/components/VaultActions.tsx` | Callback pattern |
| `src/app/vault/components/DepositModal.tsx` | `onTransactionSuccess` usage |
| `src/app/delegate/sections/DelegateContentSection/ConnectedSection.tsx` | Context refetch pattern |

### Related Infrastructure

| File | Purpose |
|------|---------|
| `src/app/user/Balances/hooks/useGetAddressBalances.ts` | Exposes `refetchBalances()` |
| `src/app/user/Balances/hooks/useGetAddressTokens.ts` | Core balance fetching logic |
| `src/app/user/Balances/context/BalancesContext.tsx` | Context provider with refetch |
| `src/shared/notification/executeTxFlow.ts` | Transaction lifecycle utility |
| `src/shared/txMessages.ts` | Toast message definitions |
