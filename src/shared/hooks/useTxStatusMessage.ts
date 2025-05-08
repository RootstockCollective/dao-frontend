import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useEffect, useState } from 'react'
import { Address, decodeFunctionData } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { TxAction } from '../types'

/**
 * A custom hook to derive a transaction status message based on the transaction hash and action.
 *
 * @param {string | null} txHash - The hash of the transaction to monitor.
 * @param {TxAction | null} [txActionInit] - An optional initial transaction action (e.g., 'staking', 'unstaking', 'allowance').
 * @returns {{ txMessage: string | null }} - The transaction status message or null if unavailable.
 */
export const useTxStatusMessage = (txHash: string | null, txActionInit?: TxAction | null) => {
  const [txAction, setTxAction] = useState<TxAction | undefined | null>(txActionInit)
  const { status: txStatus } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const { data: txData } = useTransaction({ hash: txHash as Address })

  useEffect(() => {
    if (txData) {
      const { functionName } = decodeFunctionData({
        abi: StRIFTokenAbi,
        data: txData.input,
      })
      if (functionName === 'withdrawTo') {
        setTxAction('unstaking')
      } else if (functionName === 'approve') {
        setTxAction('allowance')
      } else {
        setTxAction('staking')
      }
    }
  }, [txData])

  return {
    txMessage: txHash && txAction && txStatus ? TX_MESSAGES[txAction][txStatus] : null,
  }
}
