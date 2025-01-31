import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { Address } from 'viem'
import { DEFAULT_NFT_CONTRACT_ABI } from '@/lib/contracts'
import { publicClient, transformMulticallResults } from '@/lib/viemPublicClient'

const nftAddresses = Object.keys(communitiesMapByContract) as Address[]

interface NftInfo {
  totalSupply?: string
  tokensAvailable?: string
  name?: string
  symbol?: string
  stRifThreshold?: string
}

async function getNftDataFromAddresses() {
  const contractResultsPromised = nftAddresses.map(address => {
    const abi = {
      address,
      abi: DEFAULT_NFT_CONTRACT_ABI,
    }
    const functionNames = ['totalSupply', 'tokensAvailable', 'name', 'symbol', 'stRifThreshold']
    return publicClient.multicall({
      contracts: functionNames.map(functionName => ({ ...abi, functionName })),
    })
  })

  const results = await Promise.all(contractResultsPromised)

  return results.reduce<Record<Address, NftInfo>>(
    (previousValue, [totalSupply, tokensAvailable, name, symbol, stRifThreshold], index) => {
      previousValue[nftAddresses[index]] = transformMulticallResults({
        totalSupply,
        tokensAvailable,
        name,
        symbol,
        stRifThreshold,
      })
      return previousValue
    },
    {},
  )
}
// This is in seconds (Note: Math won't work)
export const revalidate = 60

export async function GET() {
  const result = await getNftDataFromAddresses()

  return Response.json(result)
}

export type NftDataFromAddressesReturnType = ReturnType<typeof getNftDataFromAddresses>
