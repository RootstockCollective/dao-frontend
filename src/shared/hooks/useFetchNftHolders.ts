import { Address } from 'viem'
import { fetchNftHoldersOfAddress } from '@/app/user/Balances/actions'
import { usePagination } from '@/shared/hooks/usePagination'
import { usePaginationUi } from '@/shared/hooks/usePaginationUi'

export const useFetchNftHolders = (address: Address) => {
  const query = usePagination({
    queryKey: ['nft_holders'],
    queryFn: ({ pageParam }) => fetchNftHoldersOfAddress(address, pageParam),
    initialPageParam: null,
    resultsPerTablePage: 12,
    hasMorePagesProperty: 'next_page_params',
    getNextPageParam: lastPage => lastPage.next_page_params,
  })

  const ui = usePaginationUi(query)

  return { ...query, ...ui }
}
