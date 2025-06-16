import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { config } from '@/config'
import { showToast, updateToast } from '@/shared/lib/toastUtils'
import { TX_MESSAGES } from '@/shared/txMessages'
import { waitForTransactionReceipt } from '@wagmi/core'
import { Id } from 'react-toastify'
import { Hash } from 'viem'

interface Props {
  onRequestTx: () => Promise<Hash>
  onSuccess?: () => void
  action: keyof typeof TX_MESSAGES
}

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
 * @remarks
 * - User-rejected transactions (wallet cancellations) are silently ignored
 * - Toast notifications are automatically managed based on the action type
 * - Transaction hash is used as the toast ID for consistent updates
 * - Error toasts are shown for both transaction failures and network errors
 */
export const waitForTx = async ({ onRequestTx, onSuccess, action }: Props): Promise<void> => {
  let txHash: Hash | undefined
  const { success, error, pending } = TX_MESSAGES[action]

  try {
    // Step 1: Initiate the transaction
    txHash = await onRequestTx()

    // Step 2: Show pending toast notification
    showToast({
      ...pending,
      dataTestId: `${pending.severity}-tx-${txHash}`,
      toastId: txHash as Id,
      txHash,
    })

    // Step 3: Wait for transaction confirmation on the blockchain
    await waitForTransactionReceipt(config, {
      hash: txHash,
    })

    // Step 4: Update toast to success notification
    updateToast(txHash, {
      ...success,
      dataTestId: `${success.severity}-tx-${txHash}`,
    })

    // Step 5: Execute success callback if provided
    onSuccess?.()
  } catch (err) {
    // Handle errors, but ignore user-rejected transactions
    if (!isUserRejectedTxError(err)) {
      console.error(`Error requesting ${action} tx`, err)

      // Show error toast - update existing toast if we have a hash, otherwise show new toast
      if (txHash) {
        updateToast(txHash, {
          ...error,
          dataTestId: `${error.severity}-tx-${txHash}`,
          txHash,
        })
      } else {
        showToast({
          ...error,
          dataTestId: `${error.severity}-tx`,
        })
      }
    }
  }
}
