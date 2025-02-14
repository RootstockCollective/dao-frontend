import { Address } from 'viem'
import { useReadContract, UseReadContractReturnType } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Modify } from '@/shared/utility'
import { useMigrationContext } from '@/shared/context/MigrationContext'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'

export type RewardPercentageToApply = Modify<
  UseReadContractReturnType,
  {
    data?: bigint
  }
>

export const useGetRewardPercentageToApply = (builder: Address): RewardPercentageToApply => {
  const { builderRegistryAddress } = useMigrationContext()

  const response = useReadContract({
    address: builderRegistryAddress,
    abi: BuilderRegistryAbi,
    functionName: 'getRewardPercentageToApply',
    args: [builder],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    ...response,
    data: response.data ? BigInt(response.data) : undefined,
  }
}
