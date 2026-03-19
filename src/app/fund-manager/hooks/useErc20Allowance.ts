import { useCallback, useMemo } from 'react'
import { Address, erc20Abi, parseEther, zeroAddress } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
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
export const useErc20Allowance = (
  tokenAddress: Address | undefined,
  spenderAddress: Address,
  amount: string,
) => {
  const { address } = useAccount()
  const isReady = !!tokenAddress && !!address

  const { data: allowanceBalance, isLoading: isAllowanceReadLoading } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'allowance',
    args: [address!, spenderAddress],
    query: {
      enabled: isReady,
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const amountWei = useMemo(() => parseAmountWei(amount), [amount])

  const isAllowanceEnough = useMemo(
    () => amountWei > 0n && !!allowanceBalance && allowanceBalance >= amountWei,
    [allowanceBalance, amountWei],
  )

  // useContractWrite must always run; use zeroAddress only as a typed placeholder until tokenAddress exists.
  const contractWriteConfig = useMemo(
    () => ({
      abi: erc20Abi,
      address: tokenAddress ?? zeroAddress,
      functionName: 'approve' as const,
      args: [spenderAddress, amountWei] as readonly [Address, bigint],
    }),
    [tokenAddress, spenderAddress, amountWei],
  )

  const {
    onRequestTransaction: requestApproveTx,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash: allowanceTxHash,
  } = useContractWrite(contractWriteConfig)

  const onRequestAllowance = useCallback(() => {
    if (!isReady) {
      return Promise.reject(new Error('Wallet or token address not ready'))
    }
    return requestApproveTx()
  }, [isReady, requestApproveTx])

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
