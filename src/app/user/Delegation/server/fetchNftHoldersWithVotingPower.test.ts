import { parseEther } from 'viem'
import { describe, expect, it, vi } from 'vitest'

const { DENIED, KEPT } = vi.hoisted(() => ({
  DENIED: '0x17296956b4E07Ff8931E4fF4EA06709fAb70B879',
  KEPT: '0xd40b4ed6BcDC63261aaE3eb9EB72D00BAFB7A032',
}))

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))
vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<object>()),
  OG_CONTRIBUTORS_NFT_ADDRESS: '0x5b20edd661a2b87a9c9ae55d3e3b09281dc71c48',
  DELEGATES_DENYLIST: [DENIED.toLowerCase()],
}))
vi.mock('@/lib/rns', () => ({ resolveRnsDomain: () => Promise.resolve(null) }))
vi.mock('@/lib/viemPublicClient', () => ({
  publicClient: {
    multicall: ({ contracts }: { contracts: { args: [string] }[] }) =>
      Promise.resolve(contracts.map(() => ({ result: parseEther('100') }))),
  },
}))
vi.mock('@/app/user/Balances/actions', () => ({
  fetchNftHoldersOfAddress: () =>
    Promise.resolve({
      items: [
        { owner: DENIED, id: '11', image_url: '', metadata: {}, ens_domain_name: 'curia.rsk' },
        { owner: KEPT, id: '17', image_url: '', metadata: {}, ens_domain_name: 'puddii.rsk' },
      ],
      next_page_params: null,
    }),
}))

import { getCachedNftHoldersShepherds } from './fetchNftHoldersWithVotingPower'

describe('getCachedNftHoldersShepherds', () => {
  it('leaves out the denylisted holders even though they still hold the NFT', async () => {
    const holders = await getCachedNftHoldersShepherds()

    expect(holders.map(h => h.address)).toEqual([KEPT])
    expect(holders[0]).toMatchObject({ RNS: 'puddii.rsk', votingPower: 100 })
  })
})
