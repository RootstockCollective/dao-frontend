import { Alert } from '@/components/Alert'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { TX_MESSAGES } from '@/shared/txMessages'
import { Interface } from 'ethers'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'

type TxMessage =
  (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES][keyof (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES]]

interface Props {
  messageType: 'proposal' | 'staking' | 'unstaking'
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
  const { data: txData } = useTransaction({ hash: txHash as Address })
  const [isDismissed, setIsDismissed] = useState(false)
  const [txType, setTxType] = useState<typeof messageType>(messageType)

  let message: TxMessage | null = null
  if (txHash && txStatus) {
    message = TX_MESSAGES[txType][txStatus]
  }
  const onDismiss = () => setIsDismissed(true)

  useEffect(() => {
    if (txStatus === 'success' || txHash) {
      setIsDismissed(false)
    }
  }, [txStatus, txHash])

  // check if the tx is an unstaking tx
  useEffect(() => {
    if (messageType === 'staking' && txData) {
      const stRIF = new Interface(StRIFTokenAbi)
      const functionName = stRIF.parseTransaction({ data: txData.input })?.name
      if (functionName === 'withdrawTo') {
        setTxType('unstaking')
      } else {
        setTxType('staking')
      }
    }
  }, [messageType, txData])

  if (message && !isDismissed) {
    return <Alert {...message} onDismiss={onDismiss} data-testid={messageType} />
  }

  return null
}
