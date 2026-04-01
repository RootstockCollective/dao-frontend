import { Address } from 'viem'

import { fetchTokenHoldersOfAddress } from '@/app/user/Balances/actions'
import { NextPageParams, ServerResponseV2, TokenHoldersResponse } from '@/app/user/Balances/types'
import { useInfinitePagination } from '@/shared/hooks/useInfinitePagination'
import { usePaginationUi } from '@/shared/hooks/usePaginationUi'

export const useFetchTokenHolders = (address: Address) => {
  const query = useInfinitePagination<
    TokenHoldersResponse,
    NextPageParams | undefined,
    ServerResponseV2<TokenHoldersResponse>
  >({
    queryKey: ['tokenHolders'],
    queryFn: ({ pageParam }) => fetchTokenHoldersOfAddress(address, pageParam ?? null),
    getNextPageParam: lastPage => lastPage.next_page_params ?? undefined,
    initialPageParam: undefined,
    resultsPerTablePage: 10,
  })

  const ui = usePaginationUi(query)

  return { ...query, ...ui }
}
