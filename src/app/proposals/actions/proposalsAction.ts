'use server'

import { publicClient } from '@/lib/viemPublicClient'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { GovernorAbi } from '@/lib/abis/Governor'
import { unstable_cache } from 'next/cache'

const fetchProposalSharedDetails = async () => {
  // Proposal Threshold (from governor)
  // StRIF Decimals

  const data = await publicClient.multicall({
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
    ],
  })
  if (data[0].status !== 'success' || data[1].status !== 'success') {
    throw new Error('Failed to fetch proposal shared details')
  }

  return {
    stRIFDecimals: data[0].result,
    proposalThreshold: data[1].result.toString(),
  }
}

export const getCachedProposalSharedDetails = unstable_cache(fetchProposalSharedDetails, undefined, {
  revalidate: 3600, // 1 hour in seconds
})
