import { useBalance, useReadContracts } from 'wagmi'
import { Address } from 'viem'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { currentEnvContracts } from '@/lib/contracts'
import { ZeroAddress } from 'ethers'
import { AddressToken } from '@/app/user/types'

const getTokenFunction = (tokenAddress: string, userAddress: string, functionName: 'balanceOf' | 'symbol') =>
  ({
    abi: RIFTokenAbi,
    address: tokenAddress as Address,
    functionName,
    args: functionName === 'balanceOf' ? ([userAddress as Address] as [Address]) : ([] as []),
  }) as const

type TokenData = [{ result: string | bigint }, { result: string | bigint }]

const buildTokenBalanceObject = (symbol: keyof typeof currentEnvContracts, tokenData?: TokenData) => ({
  symbol: tokenData ? tokenData?.[1]?.result : symbol,
  contractAddress: currentEnvContracts[symbol],
  balance: tokenData?.[0]?.result ? tokenData[0].result.toString() : '0',
})

export const useGetAddressTokens = (address: string, chainId: number) => {
  const { data: RBTC } = useBalance({ address: address as Address, chainId })
  const { data: RIF } = useReadContracts({
    contracts: [
      getTokenFunction(currentEnvContracts.RIF, address, 'balanceOf'),
      getTokenFunction(currentEnvContracts.RIF, address, 'symbol'),
    ],
    query: {
      refetchInterval: 10000,
    },
  })
  const { data: stRIF } = useReadContracts({
    contracts: [
      getTokenFunction(currentEnvContracts.stRIF, address, 'balanceOf'),
      getTokenFunction(currentEnvContracts.stRIF, address, 'symbol'),
    ],
    query: {
      refetchInterval: 10000,
    },
  })
  return {
    data: [
      buildTokenBalanceObject('stRIF', stRIF as TokenData),
      buildTokenBalanceObject('RIF', RIF as TokenData),
      {
        symbol: RBTC?.symbol || 'rBTC',
        balance: RBTC?.value.toString() || '0',
        contractAddress: ZeroAddress,
      },
    ] as AddressToken[],
  }
}
