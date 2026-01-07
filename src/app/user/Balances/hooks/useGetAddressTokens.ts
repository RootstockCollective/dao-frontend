import { useBalance, useReadContracts } from 'wagmi'
import { Address } from 'viem'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts, MulticallAddress } from '@/lib/contracts'
import { AddressToken } from '@/app/user/types'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/utils'
import { TokenInfoReturnType } from '@/app/user/api/tokens/route'
import { AVERAGE_BLOCKTIME, RBTC, RIF, STRIF, USDRIF, USDT0 } from '@/lib/constants'

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
  symbol: tokenData?.[1]?.result ?? symbol,
  contractAddress: tokenContracts[symbol],
  balance: tokenData?.[0]?.result ? tokenData[0].result.toString() : '0',
  decimals: decimals ?? 18,
})

export const useGetAddressTokens = (address: Address, chainId?: number) => {
  const {
    data: rbtc,
    isLoading: rbtcLoading,
    error: rbtcError,
    refetch: refetchRbtc,
  } = useBalance({ address, chainId })
  const {
    data: contracts,
    isLoading: contractsLoading,
    error: contractsError,
    refetch: refetchContracts,
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

  const rifTokenData =
    contracts && tokenData && ([contracts[0], { result: tokenData[tokenContracts.RIF].symbol }] as TokenData)
  const stRIFTokenData =
    contracts &&
    tokenData &&
    ([contracts[1], { result: tokenData[tokenContracts.stRIF].symbol }] as TokenData)

  const usdrifTokenData =
    contracts &&
    tokenData &&
    ([contracts[2], { result: tokenData[tokenContracts.USDRIF].symbol }] as TokenData)

  const usdt0TokenData =
    contracts &&
    tokenData &&
    ([contracts[3], { result: tokenData[tokenContracts.USDT0]?.symbol }] as TokenData)

  const refetch = () => {
    refetchRbtc()
    refetchContracts()
  }

  return {
    data: [
      buildTokenBalanceObject(
        STRIF,
        stRIFTokenData,
        Number(tokenData?.[tokenContracts.stRIF]?.decimals) || 18,
      ),
      buildTokenBalanceObject(RIF, rifTokenData, Number(tokenData?.[tokenContracts.RIF]?.decimals) || 18),
      {
        symbol: RBTC,
        balance: rbtc?.value.toString() || '0',
        contractAddress: tokenContracts[RBTC],
        decimals: 18,
      },
      buildTokenBalanceObject(
        USDRIF,
        usdrifTokenData,
        Number(tokenData?.[tokenContracts.USDRIF]?.decimals) || 18,
      ),
      buildTokenBalanceObject(
        USDT0,
        usdt0TokenData,
        Number(tokenData?.[tokenContracts.USDT0]?.decimals) || 18,
      ),
    ] as AddressToken[],
    isLoading: rbtcLoading || contractsLoading || IsTokenDataLoading,
    error: rbtcError ?? contractsError ?? tokenDataError,
    refetch,
  }
}
