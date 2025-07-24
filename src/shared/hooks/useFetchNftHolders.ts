import { getCachedNftHolders } from '@/app/communities/nft/server/fetchNftHolders'
import { NftHolderItem } from '@/app/user/sections/Balances/types'
import { usePagination } from '@/shared/hooks/usePagination'
import { usePaginationUi } from '@/shared/hooks/usePaginationUi'
import { Address } from 'viem'

export const useFetchNftHolders = (address: Address) => {
  const query = usePagination<NftHolderItem>({
    queryKey: ['nft_holders'],
    queryFn: () => getCachedNftHolders(address),
    resultsPerTablePage: 12,
  })

  const ui = usePaginationUi(query)

  return { ...query, ...ui }
}
