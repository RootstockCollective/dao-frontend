import { useMemo } from 'react'
import { UseReadContractReturnType, useReadContracts } from 'wagmi'

import { getAbi, type RBTCAsyncVaultAbi } from '@/lib/abis/btc-vault'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import { UseReadContractConfig, ViewPureFunctionName } from '../types'
import { ReadRbtcVaultQueryOverrides } from './types'

type RbtcAsyncVaultFunctionName = ViewPureFunctionName<RBTCAsyncVaultAbi>

type RbtcAsyncVaultConfig<TFunctionName extends RbtcAsyncVaultFunctionName> = UseReadContractConfig<
  RBTCAsyncVaultAbi,
  TFunctionName
>

/** Union of all single-call configs for the vault (ensures array element accepts any one config). */
type AnyRbtcVaultConfig = {
  [K in RbtcAsyncVaultFunctionName]: RbtcAsyncVaultConfig<K>
}[RbtcAsyncVaultFunctionName]

/** Maps a tuple of vault read configs to the tuple of their return data types. */
type RbtcVaultBatchDataTuple<T extends readonly AnyRbtcVaultConfig[]> = {
  [K in keyof T]: T[K] extends RbtcAsyncVaultConfig<infer Fn>
    ? UseReadContractReturnType<RBTCAsyncVaultAbi, Fn>['data']
    : { error: Error | null }
}

export type { RbtcAsyncVaultConfig, RbtcAsyncVaultFunctionName }

/**
 * Batch read of multiple view/pure functions from the RBTC Async Vault contract.
 * Single isLoading and error for the whole batch; data is a tuple in the same order as configs.
 *
 * @param configs - Readonly tuple of per-call configs (functionName, optional args).
 * @param query - Optional query overrides (enabled, refetchInterval, retry).
 * @returns data tuple, isLoading, error, and refetch from useReadContracts.
 */
export function useReadRbtcVaultBatch<T extends readonly AnyRbtcVaultConfig[]>(
  configs: T,
  query?: ReadRbtcVaultQueryOverrides,
): {
  data: RbtcVaultBatchDataTuple<T>
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const abi = getAbi('RBTCAsyncVaultAbi')
  const contracts = useMemo(
    () =>
      configs.map(config => ({
        abi,
        address: rbtcVault.address,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(config as any),
      })),
    [abi, configs],
  )

  const {
    data: results,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts,
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })

  const data = useMemo((): RbtcVaultBatchDataTuple<T> => {
    if (!results) return configs.map(() => {}) as RbtcVaultBatchDataTuple<T>
    return results.map(({ result, error: callError, status }) =>
      status === 'success' && !callError ? result : undefined,
    ) as RbtcVaultBatchDataTuple<T>
  }, [results, configs])

  return {
    data,
    isLoading,
    error: error ?? null,
    refetch,
  }
}
