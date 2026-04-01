'use server'
import { unstable_cache } from 'next/cache'

import { fetchNftHoldersOfAddress } from '@/app/user/Balances/actions'
import { NextPageParams, NftHolderItem } from '@/app/user/Balances/types'
import { ipfsGatewayUrl } from '@/lib/ipfs'

/**
 * Fetches all NFT holders and returns them sorted in ascending order (starting from the oldest holder).
 */
const getAllNftHolders = async (nftAddress: string) => {
  let nextPageParams: NextPageParams | null = null
  let allData: NftHolderItem[] = []
  try {
    do {
      const { items, next_page_params: next } = await fetchNftHoldersOfAddress(nftAddress, nextPageParams)
      allData = allData.concat(items)
      nextPageParams = next
    } while (nextPageParams)
  } catch (err) {
    const rawErrorMessage = err instanceof Error ? err.message : String(err ?? 'Unknown error')
    const sanitizedErrorMessage = rawErrorMessage.replaceAll(/[\x00-\x1f\x7f]/g, ' ')
    console.log('getAllNftHolders No holders found:', sanitizedErrorMessage)
  }
  return (
    allData
      // convert IPFS URLs to HTTP gateway URLs
      .map(item => ({ ...item, image_url: ipfsGatewayUrl(item.image_url) }))
      .sort((a, b) => Number(a.id) - Number(b.id))
  )
}

export const getCachedNftHolders = unstable_cache(getAllNftHolders, ['cached_nft_holders'], {
  revalidate: 60,
  tags: ['cached_nft_holders'],
})
