'use client'

import { useCallback } from 'react'
import type { Hash } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'

import { useTransactionStatus } from '@/app/user/Stake/hooks/useTransactionStatus'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { rbtcVault } from '@/lib/contracts'

/**
 * ERC-20 allowance for vault shares. The vault at `RBTC_VAULT_ADDRESS` is the share
 * token; `requestRedeem` uses `transferFrom`, so the user approves the vault on itself
 * (`approve(vault, shares)` on the vault contract).
 */
export function useBtcVaultSharesAllowance() {
  const { address } = useAccount()

  const {
    data: allowance,
    refetch,
    isLoading,
    isFetching,
  } = useReadContract({
    abi: RIFTokenAbi,
    address: rbtcVault.address,
    functionName: 'allowance',
    args: address ? [address, rbtcVault.address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 5000,
    },
  })

  const { writeContractAsync, data: approveTxHash, isPending: isRequesting } = useWriteContract()
  const { isTxPending, isTxFailed } = useTransactionStatus(approveTxHash)

  const requestApproveShares = useCallback(
    async (shares: bigint): Promise<Hash> => {
      if (!address) return Promise.reject(new Error('Wallet not connected'))
      if (shares <= 0n) return Promise.reject(new Error('Invalid shares amount'))
      return writeContractAsync({
        abi: RIFTokenAbi,
        address: rbtcVault.address,
        functionName: 'approve',
        args: [rbtcVault.address, shares],
      })
    },
    [address, writeContractAsync],
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
    refetchAllowance: refetch,
    isAllowanceReadLoading: isLoading,
    isAllowanceFetching: isFetching,
    requestApproveShares,
    hasAllowanceFor,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceTxHash: approveTxHash,
  }
}
