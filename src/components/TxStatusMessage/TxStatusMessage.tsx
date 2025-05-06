import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { showToastAlert, updateToastAlert } from '@/shared/lib/toastAlert'
import { TX_MESSAGES } from '@/shared/txMessages'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Id } from 'react-toastify'
import { Address, decodeFunctionData } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'

type TxMessage =
  (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES][keyof (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES]]

type TxMessageType = 'proposal' | 'staking' | 'unstaking'
type TxStatusSeverity = 'success' | 'error' | 'warning'

export const useTxStatusMessage = () => {
  const searchParams = useSearchParams()
  const txHash = searchParams?.get('txHash')
  const pathname = usePathname()
  const isProposalPage = pathname.includes('/proposals')
  const { status: txStatus } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const { data: txData } = useTransaction({ hash: txHash as Address })
  const [txType, setTxType] = useState<TxMessageType>(isProposalPage ? 'proposal' : 'staking')
  const toastIdRef = useRef<Id | null>(null)

  let message: TxMessage | null = null
  if (txHash && txStatus) {
    message = TX_MESSAGES[txType][txStatus]
  }

  // check if the tx is an unstaking tx
  useEffect(() => {
    if (txType === 'staking' && txData) {
      const { functionName } = decodeFunctionData({
        abi: StRIFTokenAbi,
        data: txData.input,
      })
      if (functionName === 'withdrawTo') {
        setTxType('unstaking')
      } else {
        setTxType('staking')
      }
    }
  }, [txData])

  useEffect(() => {
    if (message && txHash) {
      const txStatusSeverity: Record<string, TxStatusSeverity> = {
        success: 'success',
        error: 'error',
        pending: 'warning',
      }

      const toastProps = {
        title: message.title,
        content: message.content,
        severity: txStatusSeverity[txStatus],
        dismissible: txStatus !== 'pending',
        closeButton: txStatus !== 'pending',
        dataTestId: `TxStatus-${txStatus}`,
        toastId: txHash,
      }

      if (toastIdRef.current) {
        updateToastAlert(toastIdRef.current, toastProps)
      } else {
        const toastId = showToastAlert(toastProps)
        if (txStatus === 'pending') {
          toastIdRef.current = toastId
        }
      }
    }
  }, [message, txStatus, txHash])
}
