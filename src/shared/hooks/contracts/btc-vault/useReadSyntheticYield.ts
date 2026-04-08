import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'

import { getAbi, SyntheticYieldAbi } from '@/lib/abis/btc-vault'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { syntheticYield } from '@/lib/contracts'

import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type SyntheticYieldFunctionName = ViewPureFunctionName<SyntheticYieldAbi>

type SyntheticYieldConfig<TFunctionName extends SyntheticYieldFunctionName> = UseReadContractConfig<
  SyntheticYieldAbi,
  TFunctionName
>

export const useReadSyntheticYield = <TFunctionName extends SyntheticYieldFunctionName>(
  config: SyntheticYieldConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<SyntheticYieldAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<SyntheticYieldAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('SyntheticYieldAbi'),
    address: syntheticYield.address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
