import { fetchTokenHoldersOfAddress } from '@/app/user/Balances/actions'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import { NextPageParams, ServerResponseV2, TokenHoldersResponse } from '@/app/user/Balances/types'

export const useFetchTokenHolders = (address: Address) => {
  return useInfiniteQuery<ServerResponseV2<TokenHoldersResponse>, Error>({
    queryKey: [`tokenHolders${address}`, address],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => fetchTokenHoldersOfAddress(address, pageParam as NextPageParams),
    getNextPageParam: lastPage => {
      return lastPage.next_page_params
    },
  })
}
