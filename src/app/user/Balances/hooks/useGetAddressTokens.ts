import { useBalance, useReadContracts } from 'wagmi'
import { Address, zeroAddress } from 'viem'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts, MulticallAddress } from '@/lib/contracts'
import { AddressToken } from '@/app/user/types'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/utils'
import { TokenInfoReturnType } from '@/app/user/api/tokens/route'
import { AVERAGE_BLOCKTIME, RBTC } from '@/lib/constants'

const getTokenFunction = (
  tokenAddress: Address,
  userAddress: Address,
  functionName: 'balanceOf' | 'symbol',
) =>
  ({
    abi: RIFTokenAbi,
    address: tokenAddress,
    functionName,
    args: functionName === 'balanceOf' ? ([userAddress?.toLowerCase()] as [Address]) : ([] as []),
  }) as const

type TokenData = { result: string | bigint; error?: object }[]

const buildTokenBalanceObject = (
  symbol: keyof typeof tokenContracts,
  tokenData?: TokenData,
  decimals?: number,
) => ({
  symbol: tokenData ? tokenData?.[1]?.result : symbol,
  contractAddress: tokenContracts[symbol],
  balance: tokenData?.[0]?.result ? tokenData[0].result.toString() : '0',
  decimals: decimals ?? 18,
  name: symbol,
})

export const useGetAddressTokens = (address: Address, chainId?: number) => {
  const { data: rbtc, isLoading: rbtcLoading, error: rbtcError } = useBalance({ address, chainId })
  const {
    data: contracts,
    isLoading: contractsLoading,
    error: contractsError,
  } = useReadContracts({
    contracts: [
      getTokenFunction(tokenContracts.RIF, address, 'balanceOf'),
      getTokenFunction(tokenContracts.stRIF, address, 'balanceOf'),
      getTokenFunction(tokenContracts.USDRIF, address, 'balanceOf'),
      getTokenFunction(tokenContracts.USDT0, address, 'balanceOf'),
    ],
    multicallAddress: MulticallAddress,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  const {
    data: tokenData,
    isLoading: IsTokenDataLoading,
    error: tokenDataError,
  } = useQuery({
    queryKey: ['tokenData'],
    queryFn: () =>
      axiosInstance.get<TokenInfoReturnType>('/user/api/tokens', { baseURL: '/' }).then(({ data }) => data),
  })

  const RIF =
    contracts && tokenData && ([contracts[0], { result: tokenData[tokenContracts.RIF].symbol }] as TokenData)
  const stRIF =
    contracts &&
    tokenData &&
    ([contracts[1], { result: tokenData[tokenContracts.stRIF].symbol }] as TokenData)

  const USDRIF =
    contracts &&
    tokenData &&
    ([contracts[2], { result: tokenData[tokenContracts.USDRIF].symbol }] as TokenData)

  const USDT0Token =
    contracts &&
    tokenData &&
    ([contracts[3], { result: tokenData[tokenContracts.USDT0].symbol }] as TokenData)

  return {
    data: [
      buildTokenBalanceObject(
        'stRIF',
        stRIF,
        tokenData?.[tokenContracts.stRIF]?.decimals
          ? Number(tokenData[tokenContracts.stRIF].decimals)
          : undefined,
      ),
      buildTokenBalanceObject(
        'RIF',
        RIF,
        tokenData?.[tokenContracts.RIF]?.decimals
          ? Number(tokenData[tokenContracts.RIF].decimals)
          : undefined,
      ),
      {
        symbol: RBTC,
        balance: rbtc?.value.toString() || '0',
        contractAddress: tokenContracts[RBTC],
        decimals: 18,
        name: RBTC,
      },
      buildTokenBalanceObject(
        'USDRIF',
        USDRIF,
        tokenData?.[tokenContracts.USDRIF]?.decimals
          ? Number(tokenData[tokenContracts.USDRIF].decimals)
          : undefined,
      ),
      buildTokenBalanceObject(
        'USDT0',
        USDT0Token,
        tokenData?.[tokenContracts.USDT0]?.decimals
          ? Number(tokenData[tokenContracts.USDT0].decimals)
          : undefined,
      ),
    ] as AddressToken[],
    isLoading: rbtcLoading || contractsLoading || IsTokenDataLoading,
    error: rbtcError ?? contractsError ?? tokenDataError,
  }
}
