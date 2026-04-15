'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAccount } from 'wagmi'

import { executeTxFlow } from '@/shared/notification'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS } from '../constants'
import type { RequestType, VaultRequest } from '../services/types'
import { useBtcVaultInvalidation } from './useBtcVaultInvalidation'
import { useClaimRequest } from './useClaimRequest'
import { useClaimSharesFlowCommitted } from './useClaimSharesFlowCommitted'

export interface UseBtcVaultFinalizeSharesFlowParams {
  /** Claimable deposit or claimable withdrawal request from the parent; null when none. */
  vaultRequest: VaultRequest | null
  /** Which request shape this control handles (deposit = claim shares, withdrawal = redeem shares). */
  expectedType: RequestType
  /** After on-chain success: refresh active requests / eligibility (may be async). */
  onAfterRefetch?: () => void | Promise<void>
}

export interface UseBtcVaultFinalizeSharesFlowResult {
  /** True when the primary or busy button should render (wallet + matching claimable request + reads + eligibility). */
  shouldRender: boolean
  /** True while tx or refetch UI should show the busy branch. */
  isBusy: boolean
  /** Starts finalize tx flow (claim deposit or claim redeem per `useClaimRequest`). */
  handleFinalize: () => Promise<void>
}

/**
 * Shared orchestration for “finalize claimable vault action” on the dashboard:
 * wagmi read + write state, `executeTxFlow`, cache invalidation, post-success refetch, and UI flags
 * that avoid flicker (wagmi pending gap + props lagging after refetch).
 */
export function useBtcVaultFinalizeSharesFlow({
  vaultRequest,
  expectedType,
  onAfterRefetch,
}: UseBtcVaultFinalizeSharesFlowParams): UseBtcVaultFinalizeSharesFlowResult {
  const { address } = useAccount()
  const claimFlowLock = useRef(false)
  const { isFlowCommitted, withFlowCommitUi } = useClaimSharesFlowCommitted()
  const { invalidateAfterAction } = useBtcVaultInvalidation()
  const { claim, canClaim, isRequesting, isTxPending, isReadingAmount, isReadingError } =
    useClaimRequest(vaultRequest)
  const [holdBusyAfterSuccess, setHoldBusyAfterSuccess] = useState(false)

  const requestMatchesType =
    !!vaultRequest && vaultRequest.type === expectedType && vaultRequest.status === 'claimable'

  useEffect(() => {
    if (!holdBusyAfterSuccess) return
    if (!vaultRequest || vaultRequest.status !== 'claimable') {
      setHoldBusyAfterSuccess(false)
    }
  }, [vaultRequest, holdBusyAfterSuccess])

  const isBusy =
    isFlowCommitted || isRequesting || isTxPending || (holdBusyAfterSuccess && requestMatchesType)

  const readReady = !isReadingAmount && !isReadingError
  const eligible = canClaim || isBusy

  const shouldRender = !!address && requestMatchesType && readReady && eligible

  const handleFinalize = useCallback(async () => {
    if (!vaultRequest || vaultRequest.type !== expectedType || vaultRequest.status !== 'claimable') {
      return
    }
    if (claimFlowLock.current) return
    claimFlowLock.current = true
    setHoldBusyAfterSuccess(false)
    try {
      await withFlowCommitUi(() =>
        executeTxFlow({
          action: 'btcVaultClaim',
          onRequestTx: () => claim(),
          onSuccess: async () => {
            await new Promise(resolve => setTimeout(resolve, BTC_VAULT_BACKEND_INDEX_DELAY_MS))
            invalidateAfterAction(vaultRequest.id)
            await onAfterRefetch?.()
            setHoldBusyAfterSuccess(true)
          },
        }),
      )
    } finally {
      claimFlowLock.current = false
    }
  }, [vaultRequest, expectedType, claim, withFlowCommitUi, invalidateAfterAction, onAfterRefetch])

  return { shouldRender, isBusy, handleFinalize }
}
