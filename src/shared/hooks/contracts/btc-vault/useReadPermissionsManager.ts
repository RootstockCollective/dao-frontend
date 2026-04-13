import { useReadContract, UseReadContractParameters, UseReadContractReturnType } from 'wagmi'

import { getAbi, type PermissionsManagerAbi } from '@/lib/abis/btc-vault'
import { permissionsManager } from '@/lib/contracts'

import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type PermissionsManagerFunctionName = ViewPureFunctionName<PermissionsManagerAbi>

type PermissionsManagerConfig<TFunctionName extends PermissionsManagerFunctionName> = UseReadContractConfig<
  PermissionsManagerAbi,
  TFunctionName
>

export const useReadPermissionsManager = <TFunctionName extends PermissionsManagerFunctionName>(
  config: PermissionsManagerConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<PermissionsManagerAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<PermissionsManagerAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('PermissionsManagerAbi'),
    address: permissionsManager.address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      ...query,
    },
  })
}
