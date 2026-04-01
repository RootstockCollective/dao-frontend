import { BufferAbi } from '@/lib/abis/btc-vault'
import { buffer } from '@/lib/contracts'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useReadContract } from 'wagmi'
import { UseReadContractReturnType } from 'wagmi'
import { UseReadContractParameters } from 'wagmi'
import { getAbi } from '@/lib/abis/btc-vault'
import { UseReadContractConfig, ViewPureFunctionName } from '../types'

type BufferFunctionName = ViewPureFunctionName<BufferAbi>

type BufferConfig<TFunctionName extends BufferFunctionName> = UseReadContractConfig<BufferAbi, TFunctionName>

export const useReadRbtcBuffer = <TFunctionName extends BufferFunctionName>(
  config: BufferConfig<TFunctionName>,
  query?: Omit<UseReadContractParameters<BufferAbi, TFunctionName>['query'], 'select'>,
): UseReadContractReturnType<BufferAbi, TFunctionName> => {
  return useReadContract({
    abi: getAbi('BufferAbi'),
    address: buffer.address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(config as any),
    query: {
      retry: true,
      refetchInterval: AVERAGE_BLOCKTIME,
      ...query,
    },
  })
}
