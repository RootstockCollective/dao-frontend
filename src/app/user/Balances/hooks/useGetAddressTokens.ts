import { TokenInfoReturnType } from '@/app/user/api/tokens/route'
import { AddressToken } from '@/app/user/types'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { MulticallAddress } from '@/lib/contracts'
import { RBTC, RIF, STRIF, TOKENS, TokenSymbol, USDRIF } from '@/lib/tokens'
import { axiosInstance } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { useBalance, useReadContracts } from 'wagmi'

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

const buildTokenBalanceObject = (symbol: TokenSymbol, tokenData?: TokenData) => ({
  symbol: tokenData ? tokenData?.[1]?.result : symbol,
  contractAddress: TOKENS[symbol].address,
  balance: tokenData?.[0]?.result ? tokenData[0].result.toString() : '0',
})

export const useGetAddressTokens = (address: Address, chainId?: number) => {
  const { data: rbtc, isLoading: rbtcLoading, error: rbtcError } = useBalance({ address, chainId })
  const {
    data: contracts,
    isLoading: contractsLoading,
    error: contractsError,
  } = useReadContracts({
    contracts: [
      getTokenFunction(TOKENS[RIF].address, address, 'balanceOf'),
      getTokenFunction(TOKENS[STRIF].address, address, 'balanceOf'),
      getTokenFunction(TOKENS[USDRIF].address, address, 'balanceOf'),
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

  const rifToken =
    contracts &&
    tokenData &&
    ([contracts[0], { result: tokenData[TOKENS[RIF].address]?.symbol }] as TokenData)
  const stRifToken =
    contracts &&
    tokenData &&
    ([contracts[1], { result: tokenData[TOKENS[STRIF].address]?.symbol }] as TokenData)

  const usdRifToken =
    contracts &&
    tokenData &&
    ([contracts[2], { result: tokenData[TOKENS[USDRIF].address]?.symbol }] as TokenData)

  return {
    data: [
      buildTokenBalanceObject(STRIF, stRifToken),
      buildTokenBalanceObject(RIF, rifToken),
      {
        symbol: RBTC,
        balance: rbtc?.value.toString() || '0',
        contractAddress: TOKENS[RBTC].address,
      },
      buildTokenBalanceObject(USDRIF, usdRifToken),
    ] as AddressToken[],
    isLoading: rbtcLoading || contractsLoading || IsTokenDataLoading,
    error: rbtcError ?? contractsError ?? tokenDataError,
  }
}
