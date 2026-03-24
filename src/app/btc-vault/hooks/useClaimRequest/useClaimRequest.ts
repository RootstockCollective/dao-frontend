'use client'

import { useCallback, useMemo } from 'react'
import type { Address, Hash } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import type { RequestType, VaultRequest } from '../../services/types'
import { useFinalizeDeposit } from '../useFinalizeDeposit'
import { useFinalizeWithdrawal } from '../useFinalizeWithdrawal'

function getRequestId(request: VaultRequest): bigint | null {
  const raw = request.type === 'deposit' ? request.epochId : request.batchRedeemId
  if (raw == null) return null
  const n = BigInt(raw)
  return n >= 0n ? n : null
}

/**
 * Reads the on-chain claimable amount and provides a one-call `claim()` function
 * that dispatches to `useFinalizeDeposit` or `useFinalizeWithdrawal` based on request type.
 *
 * Only performs the contract read when `request.status === 'claimable'`.
 */
export function useClaimRequest(request: VaultRequest | null) {
  const { address } = useAccount()
  const isClaimable = request?.status === 'claimable'
  const requestId = request ? getRequestId(request) : null
  const requestType: RequestType = request?.type ?? 'deposit'

  const functionName = requestType === 'deposit' ? 'claimableDepositRequest' : 'claimableRedeemRequest'

  const { data: claimableAmount, isLoading: isReadingAmount } = useReadContract({
    ...rbtcVault,
    functionName,
    args: address ? [address as Address] : undefined,
    query: { enabled: isClaimable && !!address },
  })

  const {
    onFinalizeDeposit,
    isRequesting: isDepositRequesting,
    isTxPending: isDepositTxPending,
  } = useFinalizeDeposit()

  const {
    onFinalizeWithdrawal,
    isRequesting: isWithdrawalRequesting,
    isTxPending: isWithdrawalTxPending,
  } = useFinalizeWithdrawal()

  const claim = useCallback((): Promise<Hash> => {
    const amount = claimableAmount as bigint | undefined
    if (!amount || amount === 0n) {
      return Promise.reject(new Error('No claimable amount available'))
    }
    return requestType === 'deposit' ? onFinalizeDeposit(amount) : onFinalizeWithdrawal(amount)
  }, [claimableAmount, requestType, onFinalizeDeposit, onFinalizeWithdrawal])

  const isRequesting = requestType === 'deposit' ? isDepositRequesting : isWithdrawalRequesting
  const isTxPending = requestType === 'deposit' ? isDepositTxPending : isWithdrawalTxPending

  return useMemo(
    () => ({
      claim,
      claimableAmount: (claimableAmount as bigint | undefined) ?? 0n,
      isReadingAmount,
      isRequesting,
      isTxPending,
      canClaim:
        isClaimable && (claimableAmount as bigint | undefined) != null && (claimableAmount as bigint) > 0n,
    }),
    [claim, claimableAmount, isReadingAmount, isRequesting, isTxPending, isClaimable],
  )
}
