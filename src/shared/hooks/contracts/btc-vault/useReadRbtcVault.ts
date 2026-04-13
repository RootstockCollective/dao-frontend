import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'

import { getAbi, type RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault'
import { rbtcVault } from '@/lib/contracts'

import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type RbtcAsyncVaultFunctionName = ViewPureFunctionName<RBTCAsyncVaultAbi>

type RbtcVaultConfig<TFunctionName extends RbtcAsyncVaultFunctionName> = UseReadContractConfig<
  RBTCAsyncVaultAbi,
  TFunctionName
>

export const useReadRbtcVault = <TFunctionName extends RbtcAsyncVaultFunctionName>(
  config: RbtcVaultConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<RBTCAsyncVaultAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<RBTCAsyncVaultAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('RBTCAsyncVaultAbi'),
    address: rbtcVault.address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      ...query,
    },
  })
}
