import { fetchTokenHoldersOfAddress } from '@/app/user/Balances/actions'
import { Address } from 'viem'
import { NextPageParams } from '@/app/user/Balances/types'
import { usePagination } from '@/shared/hooks/usePagination'
import { usePaginationUi } from '@/shared/hooks/usePaginationUi'

export const useFetchTokenHolders = (address: Address) => {
  const query = usePagination({
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
