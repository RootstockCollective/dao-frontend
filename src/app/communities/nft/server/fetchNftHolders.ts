'use server'
import { fetchNftHoldersOfAddress } from '@/app/user/Balances/actions'
import { NextPageParams, NftHolderItem } from '@/app/user/Balances/types'
import { unstable_cache } from 'next/cache'

/**
 * Fetches all NFT holders and returns them sorted in ascending order (starting from the oldest holder).
 */
const getAllNftHolders = async (nftAddress: string) => {
  let nextPageParams: NextPageParams | null = null
  let allData: NftHolderItem[] = []
  do {
    const { items, next_page_params: next } = await fetchNftHoldersOfAddress(nftAddress, nextPageParams)
    allData = allData.concat(items)
    nextPageParams = next
  } while (nextPageParams)

  return allData.sort((a: any, b: any) => a.id - b.id)
}

export const getCachedNftHolders = unstable_cache(getAllNftHolders, ['cached_nft_holders'], {
  revalidate: 60,
  tags: ['cached_nft_holders'],
})
