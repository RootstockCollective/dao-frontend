import { useAwaitedTxReporting } from '@/app/collective-rewards/shared/hooks'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { BuilderRegistryAddress } from '@/lib/contracts'
import {
  useWaitForTransactionReceipt,
  UseWaitForTransactionReceiptReturnType,
  useWriteContract,
  UseWriteContractReturnType,
} from 'wagmi'

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
    title: 'Setting new backer rewards percentage',
    errorContent: 'Error setting new backer rewards percentage',
  })

  const setNewReward = async (newReward: bigint) => {
    return await writeContractAsync({
      address: BuilderRegistryAddress,
      abi: BuilderRegistryAbi,
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
