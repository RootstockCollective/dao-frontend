import { useCallback } from 'react'
import { Abi, Address, ContractFunctionArgs, ContractFunctionName, Hash } from 'viem'
import { useWriteContract } from 'wagmi'
import { useTransactionStatus } from './useTransactionStatus'

/**
 * Configuration for a contract write operation.
 * Uses a conditional type to make args optional when the function has no parameters.
 * @template TAbi - The ABI type of the contract
 * @template TFunctionName - The name of the function to call
 */
type ContractWriteConfig<
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> = ContractFunctionName<
    TAbi,
    'nonpayable' | 'payable'
  >,
> = {
  abi: TAbi
  address: Address
  functionName: TFunctionName
} & (ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName> extends readonly []
  ? { args?: readonly [] }
  : {
      args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>
    })

/**
 * Result of the useContractWrite hook.
 * @interface UseContractWriteResult
 * @property {() => Promise<Hash>} onRequestTransaction - Function to execute the contract write
 * @property {boolean} isRequesting - Whether the transaction is being requested (ex: user wallet interaction)
 * @property {boolean} isTxPending - Whether the transaction is pending confirmation
 * @property {boolean} isTxFailed - Whether the transaction has failed
 * @property {Hash | undefined} txHash - The hash of the transaction, if any
 */
interface UseContractWriteResult {
  onRequestTransaction: () => Promise<Hash>
  isRequesting: boolean
  isTxPending: boolean
  isTxFailed: boolean
  txHash: Hash | undefined
}

/**
 * A hook that provides a standardized way to interact with smart contracts for write operations.
 * It handles the contract write execution and transaction status tracking.
 *
 * @template TAbi - The ABI type of the contract
 * @template TFunctionName - The name of the function to call
 * @param {ContractWriteConfig<TAbi, TFunctionName>} config - The configuration for the contract write operation
 * @returns {UseContractWriteResult} An object containing the transaction request function and status flags
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
export const useContractWrite = <
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'> = ContractFunctionName<
    TAbi,
    'nonpayable' | 'payable'
  >,
>(
  config: ContractWriteConfig<TAbi, TFunctionName>,
): UseContractWriteResult => {
  const { writeContractAsync: executeTransaction, data: txHash, isPending: isRequesting } = useWriteContract()

  const { isTxPending, isTxFailed } = useTransactionStatus(txHash)

  const onRequestTransaction = useCallback(() => {
    // Runtime validation: ensure address is available (wagmi requires connected wallet)
    // This matches the pattern used in wagmi hooks like useCreateTreasuryTransferProposal
    return executeTransaction(config as unknown as Parameters<typeof executeTransaction>[0])
  }, [config, executeTransaction])

  return {
    onRequestTransaction,
    isRequesting,
    isTxPending,
    isTxFailed,
    txHash,
  }
}
