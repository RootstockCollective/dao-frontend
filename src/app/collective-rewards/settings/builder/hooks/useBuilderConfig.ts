import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { Modify } from '@/shared/utility'
import { DateTime } from 'luxon'
import { Address } from 'viem'
import {
  useReadContract,
  UseReadContractReturnType,
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi'
import { useAwaitedTxReporting } from '../../../shared/hooks'
import { useEffect, useState } from 'react'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export type BackerReward = {
  previous: bigint
  next: bigint
  cooldownEndTime: DateTime
}
export type BackerRewardResponse = Modify<
  UseReadContractReturnType,
  {
    data?: BackerReward
  }
>

export const useGetBackerRewardsForBuilder = (builder: Address): BackerRewardResponse => {
  const [previous, setPrevious] = useState<bigint>(0n)
  const [next, setNext] = useState<bigint>(0n)
  const [cooldown, setCooldown] = useState<bigint>(0n)
  const { data, ...rest } = useReadContract({
    abi: BuilderRegistryAbi,
    address: BackersManagerAddress,
    functionName: 'backerRewardPercentage',
    args: [builder as Address],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  useEffect(() => {
    if (data) {
      const [prev, next, cooldown] = data
      setPrevious(prev)
      setNext(next)
      setCooldown(cooldown)
    }
  }, [data, setPrevious, setNext, setCooldown])

  return {
    ...rest,
    data: {
      previous,
      next,
      cooldownEndTime: DateTime.fromSeconds(Number(cooldown)),
    },
  }
}

export type SetBackerRewardsForBuilder = {
  data: UseWriteContractReturnType['data']
  isPending: UseWriteContractReturnType['isPending']
  isSuccess: UseWriteContractReturnType['isSuccess']
  error: UseWriteContractReturnType['error'] | UseWaitForTransactionReceiptReturnType['error']
  setNewReward: (newReward: bigint) => Promise<string>
} & Omit<UseWriteContractReturnType, 'error' | 'writeContractAsync'>

export const useSetBackerRewardsForBuilder = (): SetBackerRewardsForBuilder => {
  const { writeContractAsync, data, isPending, isSuccess, error: writeError, ...rest } = useWriteContract()
  const { data: receipt, isLoading, error: receiptError } = useWaitForTransactionReceipt({ hash: data! })

  const error = writeError || receiptError

  useAwaitedTxReporting({
    hash: data,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt,
    title: 'Setting new builder rewards percantage',
  })

  const setNewReward = async (newReward: bigint) => {
    return await writeContractAsync({
      abi: BuilderRegistryAbi,
      address: BackersManagerAddress,
      functionName: 'setBackerRewardPercentage',
      args: [newReward],
    })
  }

  return {
    data,
    isPending: isPending || isLoading,
    isSuccess: isSuccess && !!receipt,
    error,
    setNewReward,
    ...rest,
  }
}
