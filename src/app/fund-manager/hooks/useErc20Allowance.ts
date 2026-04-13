import { useMemo } from 'react'
import { Address, erc20Abi, parseEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { useContractWrite } from '@/shared/hooks/useContractWrite'

const parseAmountWei = (amount: string): bigint => {
  try {
    return parseEther(amount || '0')
  } catch {
    return 0n
  }
}

/**
 * Generic ERC-20 allowance hook usable by any fund-manager CTA.
 * Reads the current allowance and provides an approve transaction.
 *
 * @param tokenAddress - The ERC-20 token to approve (e.g. WrBTC address)
 * @param spenderAddress - The contract allowed to spend (e.g. Buffer, Vault)
 * @param amount - Human-readable amount string (in ether units)
 */
export const useErc20Allowance = (tokenAddress: Address, spenderAddress: Address, amount: string) => {
  const { address } = useAccount()

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'allowance',
    args: [address!, spenderAddress],
  })

  const amountWei = useMemo(() => parseAmountWei(amount), [amount])

  const isAllowanceEnough = useMemo(
    () => amountWei > 0n && !!allowanceBalance && allowanceBalance >= amountWei,
    [allowanceBalance, amountWei],
  )

  const contractWriteConfig = useMemo(
    () => ({
      abi: erc20Abi,
      address: tokenAddress,
      functionName: 'approve' as const,
      args: [spenderAddress, amountWei] as readonly [Address, bigint],
    }),
    [tokenAddress, spenderAddress, amountWei],
  )

  const {
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: allowanceTxHash,
    onRequestTransaction: onRequestAllowance,
  } = useContractWrite(contractWriteConfig)

  return {
    isAllowanceEnough,
    isAllowanceReadLoading,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceTxHash,
    onRequestAllowance,
  }
}
