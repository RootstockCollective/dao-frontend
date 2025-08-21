'use server'
import { fetchNftHoldersOfAddress } from '@/app/user/Balances/actions'
import { NextPageParams, NftHolderItem } from '@/app/user/Balances/types'
import { ipfsGatewayUrl } from '@/lib/ipfs'
import { unstable_cache } from 'next/cache'

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
    console.log('getAllNftHolders No holders found', err)
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
