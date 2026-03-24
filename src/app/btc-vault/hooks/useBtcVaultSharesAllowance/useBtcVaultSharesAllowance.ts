'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { rbtcVault } from '@/lib/contracts'

/**
 * ERC-20 allowance for vault shares. The async vault exposes `share()` — shares are a
 * separate token; `requestRedeem` pulls them via `transferFrom`, so the user must
 * approve the vault on the share token (not call approve on the vault contract).
 */
export function useBtcVaultSharesAllowance() {
  const { address } = useAccount()

  const { data: shareTokenAddress, isLoading: isShareAddressLoading } = useReadContract({
    ...rbtcVault,
    functionName: 'share',
    query: {
      enabled: Boolean(address),
    },
  })

  const {
    data: allowance,
    refetch,
    isLoading,
    isFetching,
  } = useReadContract({
    abi: RIFTokenAbi,
    address: shareTokenAddress,
    functionName: 'allowance',
    args: address && shareTokenAddress ? [address, rbtcVault.address] : undefined,
    query: {
      enabled: Boolean(address && shareTokenAddress),
      refetchInterval: 5000,
    },
  })

  const { writeContractAsync, data: approveTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(approveTxHash)

  const requestApproveShares = useCallback(
    async (shares: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      if (!shareTokenAddress) {
        return Promise.reject(new Error('Share token address unavailable'))
      }
      if (shares <= 0n) return Promise.reject(new Error('Invalid shares amount'))
      return writeContractAsync({
        abi: RIFTokenAbi,
        address: shareTokenAddress,
        functionName: 'approve',
        args: [rbtcVault.address, shares],
      })
    },
    [address, shareTokenAddress, writeContractAsync],
  )

  const hasAllowanceFor = useCallback(
    async (shares: bigint): Promise<boolean> => {
      if (shares <= 0n) return false
      const result = await refetch()
      const value = result.data
      return typeof value === 'bigint' && value >= shares
    },
    [refetch],
  )

  return {
    allowance: allowance as bigint | undefined,
    shareTokenAddress,
    refetchAllowance: refetch,
    isAllowanceReadLoading: isShareAddressLoading || isLoading,
    isAllowanceFetching: isFetching,
    requestApproveShares,
    hasAllowanceFor,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceTxHash: approveTxHash,
  }
}
