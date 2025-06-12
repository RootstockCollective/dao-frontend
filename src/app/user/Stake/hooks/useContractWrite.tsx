import { useCallback } from 'react'
import { Address, Hash } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTransactionStatus } from './useTransactionStatus'

/**
 * Configuration for a contract write operation.
 * @interface ContractWriteConfig
 * @property {any} abi - The ABI of the contract
 * @property {Address} address - The address of the contract
 * @property {string} functionName - The name of the function to call
 * @property {any[]} args - The arguments to pass to the function
 */
interface ContractWriteConfig {
  abi: any
  address: Address
  functionName: string
  args: any[]
}

/**
 * Result of the useContractWrite hook.
 * @interface UseContractWriteResult
 * @template T - The type of the transaction request function
 * @property {T} onRequestTransaction - Function to execute the contract write
 * @property {boolean} isRequesting - Whether the transaction is being requested (ex: user wallet interaction)
 * @property {boolean} isTxPending - Whether the transaction is pending confirmation
 * @property {boolean} isTxFailed - Whether the transaction has failed
 * @property {Hash | undefined} txHash - The hash of the transaction, if any
 */
interface UseContractWriteResult<T> {
  onRequestTransaction: T
  isRequesting: boolean
  isTxPending: boolean
  isTxFailed: boolean
  txHash: Hash | undefined
}

/**
 * A hook that provides a standardized way to interact with smart contracts for write operations.
 * It handles the contract write execution and transaction status tracking.
 *
 * @template T - The type of the transaction request function
 * @param {ContractWriteConfig} config - The configuration for the contract write operation
 * @returns {UseContractWriteResult<T>} An object containing the transaction request function and status flags
 *
 * @example
 * ```tsx
 * const { onRequestTransaction, isRequesting, isTxPending, isTxFailed, txHash } = useContractWrite({
 *   abi: tokenABI,
 *   address: tokenAddress,
 *   functionName: 'approve',
 *   args: [spenderAddress, amount]
 * });
 * ```
 */
export const useContractWrite = <T extends () => Promise<Hash>>(
  config: ContractWriteConfig,
): UseContractWriteResult<T> => {
  const { writeContractAsync: executeTransaction, data: txHash, isPending: isRequesting } = useWriteContract()

  const { isTxPending, isTxFailed } = useTransactionStatus(txHash)

  const onRequestTransaction = useCallback(
    () => executeTransaction(config),
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
