import { RewardDistributorAbi } from '@/lib/abis/v2/RewardDistributorAbi'
import { RewardDistributorAddress } from '@/lib/contracts'
import { UseReadContractParameters } from 'wagmi'
import {
  CurriedContractConfig,
  useReadContractGeneric,
  ViewPureFunctionNames,
} from '../../../../lib/useReadContractGeneric'

type RewardDistributorFunctionName = ViewPureFunctionNames<typeof RewardDistributorAbi>

type RewardDistributorConfig<TFunctionName extends RewardDistributorFunctionName> = CurriedContractConfig<
  typeof RewardDistributorAbi,
  TFunctionName
>

export const useReadRewardDistributor = <TFunctionName extends RewardDistributorFunctionName>(
  config: RewardDistributorConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<typeof RewardDistributorAbi, TFunctionName>['query'], 'select'>,
) => {
  return useReadContractGeneric(
    {
      ...(config as any),
      abi: RewardDistributorAbi,
      address: RewardDistributorAddress,
    },
    query,
  )
}
