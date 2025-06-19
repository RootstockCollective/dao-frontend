import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { config } from '@/config'
import { showToast, updateToast, ToastAlertOptions } from '@/shared/notification'
import { TX_MESSAGES } from '@/shared/txMessages'
import { TxStatus } from '@/shared/types'
import { waitForTransactionReceipt } from '@wagmi/core'
import { Id } from 'react-toastify'
import { Hash } from 'viem'

interface Props {
  onRequestTx: () => Promise<Hash>
  onSuccess?: () => void
  action: keyof typeof TX_MESSAGES
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
 * @param props.onRequestTx - Function that initiates the transaction (e.g., contract write)
 * @param props.onSuccess - Optional callback executed on successful transaction completion
 * @param props.action - Transaction type key that maps to predefined toast messages
 *
 * @example
 * ```typescript
 * // Staking RIF tokens
 * const txHash = await executeTxFlow({
 *   onRequestTx: () => stakeContract.write.stake({ value: amount }),
 *   onSuccess: () => {
 *     // Close modal, refresh balances, etc.
 *     closeStakeModal()
 *     refetchBalances()
 *   },
 *   action: 'staking'
 * })
 *
 * // The function automatically:
 * // 1. Shows "Staking in process..." toast
 * // 2. Waits for blockchain confirmation
 * // 3. Updates to "Stake successful" toast
 * // 4. Calls onSuccess callback
 * // 5. Returns transaction hash
 * ```
 *
 * @remarks
 * - User-rejected transactions (wallet cancellations) are silently ignored
 * - Toast notifications are automatically managed based on the action type
 * - Transaction hash is used as the toast ID for consistent updates
 * - Error toasts are shown for both transaction failures and network errors
 */
export const executeTxFlow = async ({ onRequestTx, onSuccess, action }: Props): Promise<Hash | undefined> => {
  let txHash: Hash | undefined
  const { success, error, pending } = TX_MESSAGES[action]

  try {
    txHash = await onRequestTx()
    showToast(createToastConfig(pending, txHash))

    await waitForTransactionReceipt(config, {
      hash: txHash,
    })

    updateToast(txHash, createToastConfig(success, txHash))
    onSuccess?.()
  } catch (err) {
    if (!isUserRejectedTxError(err)) {
      console.error(`Error requesting ${action} tx`, err)

      // Show error toast - update existing toast if we have a hash, otherwise show new toast
      if (txHash) {
        updateToast(txHash, createToastConfig(error, txHash))
      } else {
        showToast(createToastConfig(error))
      }
    }
  }
  return txHash
}
