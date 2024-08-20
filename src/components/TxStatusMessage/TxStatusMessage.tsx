import { Alert } from '@/components/Alert'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'

type TxMessage =
  (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES][keyof (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES]]

interface Props {
  messageType: 'proposal' | 'staking'
}

/**
 * This component will check the txHash that exists in the query string
 * If it exists, then it'll show the appropriate alert message
 * @constructor
 */
export const TxStatusMessage = ({ messageType }: Props) => {
  const searchParams = useSearchParams()
  const txHash = searchParams?.get('txHash')
  const { status: txStatus } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const [isDismissed, setIsDismissed] = useState(false)

  let message: TxMessage | null = null
  if (txHash && txStatus) {
    message = TX_MESSAGES[messageType][txStatus]
  }

  const onDismiss = () => setIsDismissed(true)

  useEffect(() => {
    if (txStatus === 'success') {
      setIsDismissed(false)
    }
  }, [txStatus])

  if (message && !isDismissed) {
    return <Alert {...message} onDismiss={onDismiss} />
  }

  return null
}
