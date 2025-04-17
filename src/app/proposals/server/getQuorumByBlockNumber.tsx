'use server'
import { publicClient } from '@/lib/viemPublicClient'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import Big from '@/lib/big'
import { formatUnits } from 'viem'
import { unstable_cache } from 'next/cache'

async function getQuorumByBlockNumber(blockNumber: string) {
  const data = await publicClient.multicall({
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'quorum', args: [BigInt(blockNumber)] },
    ],
  })
  const [decimals, quorum] = data as [number, bigint]
  return {
    quorum: Big(formatUnits(quorum, decimals)).round(undefined, Big.roundHalfEven).toString(),
  }
}

export const getCachedQuorumByBlockNumber = unstable_cache(getQuorumByBlockNumber, ['cached_quorum'])
