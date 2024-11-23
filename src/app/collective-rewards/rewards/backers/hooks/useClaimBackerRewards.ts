import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useAwaitedTxReporting } from '@/app/collective-rewards/shared'
import { useBackerRewardsContext } from '../context'

export const useClaimBackerRewards = (gauges: Address[]) => {
  const { writeContractAsync, error: executionError, data: hash, isPending } = useWriteContract()
  const { canClaim, isLoading: canClaimLoading, error: canClaimError } = useBackerRewardsContext()

  const { isLoading, isSuccess, data, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const isClaimFunctionReady = !canClaimLoading && !canClaimError && canClaim()

  const error = executionError || receiptError || canClaimError

  const claimBackerReward = (rewardToken?: Address) => {
    return writeContractAsync({
      abi: BackersManagerAbi,
      address: BackersManagerAddress,
      functionName: 'claimBackerRewards',
      args: rewardToken ? [rewardToken, gauges] : [gauges],
    })
  }

  useAwaitedTxReporting({
    hash,
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
    title: 'Claiming backer rewards',
  })

  return {
    isClaimFunctionReady,
    claimRewards: (rewardToken?: Address) => isClaimFunctionReady && claimBackerReward(rewardToken),
    error,
    isPendingTx: isPending,
    isLoadingReceipt: isLoading,
    isSuccess,
    receipt: data,
  }
}
