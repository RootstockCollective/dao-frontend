import { fetchTokenHoldersOfAddress } from '@/shared/api/balances'
import { Address } from 'viem'
import { NextPageParams, TokenHoldersResponse } from '@/app/user/sections/Balances/types'
import { usePaginationUi } from '@/shared/hooks/usePaginationUi'
import { useInfinitePagination } from '@/shared/hooks/useInfinitePagination'

export const useFetchTokenHolders = (address: Address) => {
  const query = useInfinitePagination<TokenHoldersResponse>({
    queryKey: ['tokenHolders'],
    queryFn: ({ pageParam }) => fetchTokenHoldersOfAddress(address, pageParam as NextPageParams),
    getNextPageParam: lastPage => lastPage.next_page_params,
    initialPageParam: null,
    resultsPerTablePage: 10,
    hasMorePagesProperty: 'next_page_params',
  })

  const ui = usePaginationUi(query)

  return { ...query, ...ui }
}
