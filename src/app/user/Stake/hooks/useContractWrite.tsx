import { useCallback } from 'react'
import { Address, Hash } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTransactionStatus } from './useTransactionStatus'

interface ContractWriteConfig {
  abi: any
  address: Address
  functionName: string
  args: any[]
}

interface UseContractWriteResult<T> {
  onRequestTransaction: T
  isRequesting: boolean
  isTxPending: boolean
  isTxFailed: boolean
  txHash: Hash | undefined
}

export const useContractWrite = <T extends (...args: any[]) => Promise<Hash>>(
  config: ContractWriteConfig,
): UseContractWriteResult<T> => {
  const { writeContractAsync: executeTransaction, data: txHash, isPending: isRequesting } = useWriteContract()

  const { isTxPending, isTxFailed } = useTransactionStatus(txHash)

  const onRequestTransaction = useCallback(
    async (...args: Parameters<T>) => {
      console.log('🚀 ~ args:', args)
      return executeTransaction({
        ...config,
        args: args.length > 0 ? args : config.args,
      })
    },
    [config, executeTransaction],
  ) as T

  return {
    onRequestTransaction,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash,
  }
}
