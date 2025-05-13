import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useEffect, useState } from 'react'
import { Address, decodeFunctionData } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { TxAction } from '../types'

const TX_ACTIONS = {
  depositAndDelegate: 'staking',
  withdrawTo: 'unstaking',
  approve: 'allowance',
} as const

export const useTxStatusMessage = (txHash: string) => {
  const [action, setAction] = useState<TxAction | null>(null)
  const { status } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const { data } = useTransaction({ hash: txHash as Address })

  useEffect(() => {
    if (data) {
      const { functionName } = decodeFunctionData({ abi: StRIFTokenAbi, data: data.input })
      setAction(TX_ACTIONS[functionName as keyof typeof TX_ACTIONS] ?? null)
    }
  }, [data])

  return { txMessage: txHash && action && status ? TX_MESSAGES[action][status] : null }
}
