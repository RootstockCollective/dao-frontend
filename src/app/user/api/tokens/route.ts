import { publicClient, transformMulticallResults } from '@/lib/viemPublicClient'
import { tokenContracts } from '@/lib/contracts'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { Address } from 'viem'

export interface TokenInfo {
  symbol?: string
  name?: string
  decimals?: string
}

/**
 * These tokens are the ones that are queried - in case more are needed add here
 */
const tokenAddresses = [tokenContracts.RIF, tokenContracts.stRIF] as Address[]

async function getTokenData() {
  const contractCallsPromises = tokenAddresses.map(tokenAddress => {
    const abi = {
      address: tokenAddress,
      abi: RIFTokenAbi,
    }
    const functionNames = ['symbol', 'name', 'decimals']

    return publicClient.multicall({
      contracts: functionNames.map(functionName => ({ ...abi, functionName })),
    })
  })

  const results = await Promise.all(contractCallsPromises)

  return results.reduce<Record<Address, TokenInfo>>((previousValue, currentValue, currentIndex) => {
    const [symbol, name, decimals] = currentValue
    previousValue[tokenAddresses[currentIndex]] = transformMulticallResults({
      symbol,
      name,
      decimals,
    })
    return previousValue
  }, {})
}

export const revalidate = 180

// Return data of token
export async function GET() {
  const result = await getTokenData()

  return Response.json(result)
}

export type TokenInfoReturnType = ReturnType<typeof getTokenData>
