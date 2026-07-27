import { useMemo } from 'react'
import { Abi, Address } from 'viem'
import {
  useReadContract,
  UseReadContractParameters,
  UseReadContractReturnType,
  useReadContracts,
} from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

import {
  UseReadContractConfig,
  UseReadContractForMultipleArgsConfig,
  UseReadContractsConfig,
  UseReadContractWithAddressConfig,
  ViewPureFunctionName,
} from './types'

/**
 * Factories that build the `useRead<Contract>` hooks.
 *
 * Every hook shares the same shape: bind an ABI (and usually an address), forward a
 * `{ functionName, args }` config to wagmi and apply the same query defaults. The config
 * types in `./types` are conditional/union types, so they can't be spread or destructured
 * while `TAbi` is still generic — the `as any`/`as unknown as` casts below exist purely to
 * cross that boundary and are confined to this file.
 */

/** Per-hook overrides of the shared query defaults. Merged over them, never replacing them. */
export interface ReadHookQueryDefaults {
  retry?: boolean
  refetchInterval?: number | false
}

const DEFAULT_QUERY: Required<ReadHookQueryDefaults> = {
  retry: true,
  refetchInterval: AVERAGE_BLOCKTIME,
}

const withDefaults = (overrides?: ReadHookQueryDefaults): Required<ReadHookQueryDefaults> => ({
  ...DEFAULT_QUERY,
  ...overrides,
})

type QueryOverrides<TAbi extends Abi, TFunctionName extends ViewPureFunctionName<TAbi>> = Omit<
  UseReadContractParameters<TAbi, TFunctionName>['query'],
  'select'
>

type ReadData<TAbi extends Abi, TFunctionName extends ViewPureFunctionName<TAbi>> = UseReadContractReturnType<
  TAbi,
  TFunctionName
>['data']

/** Shape of a single entry of `useReadContracts`' result array, narrowed to what we consume. */
interface MultiReadResult {
  status: string
  result?: unknown
  error?: Error | null
}

/**
 * Flattens `useReadContracts` results into a plain array, logging every unsuccessful call.
 * Failed calls keep their slot (as `undefined`) so indexes stay aligned with the inputs.
 */
const reduceResults = <TData>(
  results: readonly MultiReadResult[] | undefined,
  describeCall: (index: number) => string,
): TData[] =>
  results?.reduce<TData[]>((acc, { result, error, status }, i) => {
    if (status !== 'success' || error) {
      console.error(
        `Call index: ${i}: data fetch not successful for ${describeCall(i)}.`,
        error ?? 'Unknown error',
      )
    }

    return [...acc, result as TData]
  }, []) ?? []

/**
 * Builds a read hook bound to a fixed ABI and address.
 *
 * @example
 * export const useReadBackersManager = createContractReadHook(BackersManagerAbi, BackersManagerAddress)
 */
export const createContractReadHook = <TAbi extends Abi>(
  abi: TAbi,
  address: Address,
  queryDefaults?: ReadHookQueryDefaults,
) => {
  const defaults = withDefaults(queryDefaults)

  return function useContractRead<TFunctionName extends ViewPureFunctionName<TAbi>>(
    config: UseReadContractConfig<TAbi, TFunctionName>,
    query?: QueryOverrides<TAbi, TFunctionName>,
  ): UseReadContractReturnType<TAbi, TFunctionName> {
    return useReadContract({
      abi,
      address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(config as any),
      query: {
        ...defaults,
        ...query,
      },
    })
  }
}

/**
 * Builds a read hook bound to a fixed ABI whose address is supplied by the caller,
 * for contracts deployed once per entity (a gauge per builder, for instance).
 */
export const createContractReadWithAddressHook = <TAbi extends Abi>(
  abi: TAbi,
  queryDefaults?: ReadHookQueryDefaults,
) => {
  const defaults = withDefaults(queryDefaults)

  return function useContractReadWithAddress<TFunctionName extends ViewPureFunctionName<TAbi>>(
    config: UseReadContractWithAddressConfig<TAbi, TFunctionName>,
    query?: QueryOverrides<TAbi, TFunctionName>,
  ): UseReadContractReturnType<TAbi, TFunctionName> {
    const { address, ...callConfig } = config as unknown as { address: Address } & Record<string, unknown>

    return useReadContract({
      abi,
      address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(callConfig as any),
      query: {
        ...defaults,
        ...query,
      },
    })
  }
}

/**
 * Builds a hook that calls the same function on the same ABI across many addresses.
 *
 * @param contractName - Used to identify the contract in the error logs of failed calls.
 */
export const createContractMultiAddressReadHook = <TAbi extends Abi>(
  abi: TAbi,
  contractName: string,
  queryDefaults?: ReadHookQueryDefaults,
) => {
  const defaults = withDefaults(queryDefaults)

  return function useContractMultiAddressRead<TFunctionName extends ViewPureFunctionName<TAbi>>(
    config: UseReadContractsConfig<TAbi, TFunctionName>,
    query?: QueryOverrides<TAbi, TFunctionName>,
  ) {
    const { addresses, functionName, ...callConfig } = config as unknown as {
      addresses: Address[]
      functionName: string
    } & Record<string, unknown>

    const { data: results, ...queryData } = useReadContracts({
      contracts: addresses.map(address => ({
        abi,
        address,
        functionName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(callConfig as any),
      })),
      query: {
        ...defaults,
        ...query,
      },
    })

    const data = useMemo(
      () =>
        reduceResults<ReadData<TAbi, TFunctionName>>(
          results,
          i => `${contractName}(${addresses[i]}).${functionName}`,
        ),
      [addresses, functionName, results],
    )

    return {
      data,
      ...queryData,
    }
  }
}

/**
 * Builds a hook that calls the same function on a fixed ABI and address once per argument set.
 *
 * @param contractName - Used to identify the contract in the error logs of failed calls.
 */
export const createContractMultiArgsReadHook = <TAbi extends Abi>(
  abi: TAbi,
  address: Address,
  contractName: string,
  queryDefaults?: ReadHookQueryDefaults,
) => {
  const defaults = withDefaults(queryDefaults)

  return function useContractMultiArgsRead<TFunctionName extends ViewPureFunctionName<TAbi>>(
    { args, ...callConfig }: UseReadContractForMultipleArgsConfig<TAbi, TFunctionName>,
    query?: QueryOverrides<TAbi, TFunctionName>,
  ) {
    const { functionName } = callConfig

    const { data: results, ...queryData } = useReadContracts({
      contracts: args.map(argsPerCall => ({
        abi,
        address,
        args: argsPerCall,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(callConfig as any),
      })),
      query: {
        ...defaults,
        ...query,
      },
    })

    const data = useMemo(
      () => reduceResults<ReadData<TAbi, TFunctionName>>(results, () => `${contractName}.${functionName}`),
      [functionName, results],
    )

    return {
      data,
      ...queryData,
    }
  }
}
