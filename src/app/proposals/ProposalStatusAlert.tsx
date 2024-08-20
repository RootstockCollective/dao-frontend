import { useSearchParams } from 'next/navigation'
import { useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { TRANSACTION_SENT_MESSAGES } from '@/app/proposals/shared/utils'
import { useEffect, useState } from 'react'
import { Alert } from '@/components/Alert/Alert'

/**
 * This component will check the txHash that exists in the query string
 * If it exists, then it'll show the appropriate alert message
 * @constructor
 */
export const ProposalStatusAlert = () => {
  const searchParams = useSearchParams()
  const txHash = searchParams?.get('txHash')
  const { status: proposalCreatedTxStatus } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const [isDismissed, setIsDismissed] = useState(false)

  let message: (typeof TRANSACTION_SENT_MESSAGES)[keyof typeof TRANSACTION_SENT_MESSAGES] | null = null
  if (txHash && proposalCreatedTxStatus) {
    message = TRANSACTION_SENT_MESSAGES[proposalCreatedTxStatus]
  }

  const onDismiss = () => setIsDismissed(true)

  useEffect(() => {
    if (proposalCreatedTxStatus === 'success') {
      setIsDismissed(false)
    }
  }, [proposalCreatedTxStatus])

  if (message && !isDismissed) {
    return <Alert {...message} onDismiss={onDismiss} />
  }

  return null
}
