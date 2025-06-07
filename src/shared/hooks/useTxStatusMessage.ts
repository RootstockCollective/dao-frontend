import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { TX_MESSAGES } from '@/shared/txMessages'
import { useEffect, useMemo, useState } from 'react'
import { Address, decodeFunctionData } from 'viem'
import { useTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { TxAction } from '../types'

const TX_ACTIONS = {
  depositAndDelegate: 'staking',
  withdrawTo: 'unstaking',
  approve: 'allowance',
} as const

type TxActionKey = keyof typeof TX_ACTIONS

export const useTxStatusMessage = (txHash: string) => {
  const [action, setAction] = useState<TxAction | null>(null)
  const { status } = useWaitForTransactionReceipt({ hash: txHash as Address })
  const { data } = useTransaction({ hash: txHash as Address })

  useEffect(() => {
    if (data) {
      const { functionName } = decodeFunctionData({ abi: StRIFTokenAbi, data: data.input })
      setAction(TX_ACTIONS[functionName as TxActionKey] ?? null)
    }
  }, [data])

  const txMessage = useMemo(() => {
    if (txHash && action && status) {
      return TX_MESSAGES[action][status]
    }
    return null
  }, [txHash, action, status])

  return { txMessage }
}
