'use server'

import { fetchNftHoldersOfAddress } from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/actions'
import { OG_CONTRIBUTORS_NFT_ADDRESS } from '@/lib/constants'
import { stRif } from '@/lib/contracts'
import { publicClient } from '@/lib/viemPublicClient'
import { formatEther } from 'viem'
import Big from '@/lib/big'
import { unstable_cache } from 'next/cache'
import { resolveRnsDomain } from '@/lib/rns'

export async function fetchNftHoldersShepherds() {
  const holders = await fetchNftHoldersOfAddress(OG_CONTRIBUTORS_NFT_ADDRESS, null)

  // Clean the data from any duplicates
  const holdersToUse = holders.items.reduce<Record<string, (typeof holders.items)[0]>>(
    (previous, current) => {
      previous[current.owner] = current
      return previous
    },
    {},
  )
  return await Promise.all(
    Object.values(holdersToUse).map(async holder => {
      try {
        let rns = holder.ens_domain_name
        if (!rns) {
          rns = await resolveRnsDomain(holder.owner)
        }
        return { address: holder.owner, RNS: rns }
      } catch {
        return { address: holder.owner, RNS: null }
      }
    }),
  )
}

async function getNftHoldersShepherds() {
  const holders = await fetchNftHoldersShepherds()

  // Prepare contract calls to fetch voting power
  const stRifContractCalls = holders.map(({ address }) => ({
    ...stRif,
    functionName: 'getVotes',
    args: [address.toLowerCase()],
  }))

  const votingPowerResults = await publicClient.multicall({ contracts: stRifContractCalls })

  return holders
    .map((holder, i) => {
      const votingPower = BigInt(votingPowerResults[i]?.result?.toString() || '0')
      const formatted = Big(formatEther(votingPower)).floor().toNumber()
      return {
        ...holder,
        votingPower: formatted,
      }
    })
    .filter(({ votingPower }) => votingPower > 0)
}

export const getCachedNftHoldersShepherds = unstable_cache(getNftHoldersShepherds, ['nft_shepherds'], {
  revalidate: 60, // Every 60 seconds
  tags: ['nft_shepherds'],
})
