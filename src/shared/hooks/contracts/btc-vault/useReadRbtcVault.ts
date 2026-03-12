import { getAbi, type RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault'
import { ReadRbtcVaultQueryOverrides } from './types'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { useReadContract, UseReadContractReturnType } from 'wagmi'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type RbtcAsyncVaultFunctionName = ViewPureFunctionName<RBTCAsyncVaultAbi>

type RbtcAsyncVaultConfig<TFunctionName extends RbtcAsyncVaultFunctionName> = UseReadContractConfig<
  RBTCAsyncVaultAbi,
  TFunctionName
>

/**
 * Single typed read from the RBTC Async Vault contract.
 * Use for one view/pure call (e.g. asset, currentEpoch, epochSnapshot).
 */
export const useReadRbtcVault = <TFunctionName extends RbtcAsyncVaultFunctionName>(
  config: RbtcAsyncVaultConfig<TFunctionName>,
  query?: ReadRbtcVaultQueryOverrides,
): UseReadContractReturnType<RBTCAsyncVaultAbi, TFunctionName> => {
  const result = useReadContract({
    abi: getAbi('RBTCAsyncVaultAbi'),
    address: rbtcVault.address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
  return result as UseReadContractReturnType<RBTCAsyncVaultAbi, TFunctionName>
}
