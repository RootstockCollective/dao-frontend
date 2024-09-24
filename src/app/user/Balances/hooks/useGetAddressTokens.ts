import { useBalance, useReadContracts } from 'wagmi'
import { Address } from 'viem'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { tokenContracts, MulticallAddress } from '@/lib/contracts'
import { ZeroAddress } from 'ethers'
import { AddressToken } from '@/app/user/types'

const getTokenFunction = (
  tokenAddress: Address,
  userAddress: Address,
  functionName: 'balanceOf' | 'symbol',
) =>
  ({
    abi: RIFTokenAbi,
    address: tokenAddress,
    functionName,
    args: functionName === 'balanceOf' ? ([userAddress.toLowerCase()] as [Address]) : ([] as []),
  }) as const

type TokenData = [{ result: string | bigint }, { result: string | bigint }]

const buildTokenBalanceObject = (symbol: keyof typeof tokenContracts, tokenData?: TokenData) => ({
  symbol: tokenData ? tokenData?.[1]?.result : symbol,
  contractAddress: tokenContracts[symbol],
  balance: tokenData?.[0]?.result ? tokenData[0].result.toString() : '0',
})

export const useGetAddressTokens = (address: Address, chainId: number) => {
  const { data: RBTC } = useBalance({ address, chainId })
  const { data } = useReadContracts({
    contracts: [
      getTokenFunction(tokenContracts.RIF, address, 'balanceOf'),
      getTokenFunction(tokenContracts.RIF, address, 'symbol'),
      getTokenFunction(tokenContracts.stRIF, address, 'balanceOf'),
      getTokenFunction(tokenContracts.stRIF, address, 'symbol'),
    ],
    multicallAddress: MulticallAddress,
    query: {
      refetchInterval: 5000,
    },
  })

  const RIF = data && ([data[0], data[1]] as TokenData)
  const stRIF = data && ([data[2], data[3]] as TokenData)
  return {
    data: [
      buildTokenBalanceObject('stRIF', stRIF as TokenData),
      buildTokenBalanceObject('RIF', RIF as TokenData),
      {
        symbol: RBTC?.symbol || 'RBTC',
        balance: RBTC?.value.toString() || '0',
        contractAddress: ZeroAddress,
      },
    ] as AddressToken[],
  }
}
