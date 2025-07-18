import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { config } from '@/config'
import { showToast, updateToast, ToastAlertOptions } from '@/shared/notification'
import { TX_MESSAGES } from '@/shared/txMessages'
import { TxStatus } from '@/shared/types'
import { waitForTransactionReceipt } from '@wagmi/core'
import { Id } from 'react-toastify'
import { Hash } from 'viem'

interface Props {
  action: keyof typeof TX_MESSAGES
  onRequestTx: () => Promise<Hash>
  onPending?: (txHash: Hash) => void
  onSuccess?: (txHash: Hash) => void
  onError?: (txHash: Hash | undefined, err: Error) => void
  onComplete?: (txHash: Hash | undefined) => void
}

/**
 * Creates toast configuration with consistent dataTestId and optional txHash
 */
const createToastConfig = (
  baseMessage: { severity: TxStatus; title: string; content: string; loading: boolean },
  txHash?: Hash,
): ToastAlertOptions => ({
  ...baseMessage,
  dataTestId: `${baseMessage.severity}-tx${txHash ? `-${txHash}` : ''}`,
  txHash,
  toastId: txHash as Id,
})

/**
 * Utility function that handles the complete transaction flow including:
 * - Initiating the transaction
 * - Showing pending toast notification
 * - Waiting for transaction confirmation
 * - Showing success/error toast notifications
 * - Executing success callback
 *
 * This function provides a consistent user experience across all transaction types
 * in the application by automatically managing toast notifications and error handling.
 *
 * @param props - Configuration object containing transaction parameters
 * @param props.action - Transaction type key that maps to predefined toast messages
 * @param props.onRequestTx - Function that initiates the transaction (e.g., contract write)
 * @param props.onPending - Optional callback executed when the transaction is pending
 * @param props.onSuccess - Optional callback executed on successful transaction completion
 * @param props.onError - Optional callback executed on transaction error
 * @param props.onComplete - Optional callback executed on transaction completion
 *
 * @example
 * ```typescript
 * // Staking RIF tokens
 * const txHash = await executeTxFlow({
 *   onRequestTx: () => stakeContract.write.stake({ value: amount }),
 *   onPending: (txHash) => {
 *     // Show "Loading" icon in the button
 *   },
 *   onSuccess: (txHash) => {
 *     // Close modal, refresh balances, etc.
 *     closeStakeModal()
 *     refetchBalances()
 *   },
 *   onError: (txHash, err) => {
 *     // Stop "Loading" icon in the button
 *   },
 *   onComplete: (txHash) => {
 *     // Stop "Loading" icon in the button
 *   },
 *   action: 'staking'
 * })
 *
 * // The function automatically:
 * // 1. Shows "Transaction in process..." toast
 * // 2. Waits for blockchain confirmation
 * // 3. Calls onPending callback
 * // 4. Updates to "Transaction successful" or "Transaction failed" toast
 * // 5. Calls onSuccess or onError callback
 * // 6. Returns transaction hash
 * ```
 *
 * @remarks
 * - User-rejected transactions (wallet cancellations) are silently ignored
 * - Toast notifications are automatically managed based on the action type
 * - Transaction hash is used as the toast ID for consistent updates
 * - Error toasts are shown for both transaction failures and network errors
 */
export const executeTxFlow = async ({
  action,
  onRequestTx,
  onPending,
  onSuccess,
  onError,
  onComplete,
}: Props): Promise<Hash | undefined> => {
  let txHash: Hash | undefined
  const { success, error, pending } = TX_MESSAGES[action]

  try {
    txHash = await onRequestTx()

    onPending?.(txHash)
    showToast(createToastConfig(pending, txHash))

    await waitForTransactionReceipt(config, {
      hash: txHash,
    })

    updateToast(txHash, createToastConfig(success, txHash))
    onSuccess?.(txHash)
  } catch (err) {
    if (!isUserRejectedTxError(err)) {
      onError?.(txHash, err as Error)
      console.error(`Error requesting ${action} tx`, err)

      // Show error toast - update existing toast if we have a hash, otherwise show new toast
      if (txHash) {
        updateToast(txHash, createToastConfig(error, txHash))
      } else {
        showToast(createToastConfig(error))
      }
    } else {
      onError?.(txHash, { name: 'Rejected TX', message: 'User rejected transaction' })
    }
  }
  onComplete?.(txHash)
  return txHash
}
