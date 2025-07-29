import { GridTable } from '@/components/Table'
import { Header } from '@/components/TypographyNew'
import { RIF, STRIF_ADDRESS } from '@/lib/constants'
import { useFetchTokenHolders } from '@/app/treasury/hooks/useFetchTokenHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { formatAmount } from '@/lib/utils'
import { Span } from '@/components/TypographyNew'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { useSearchParams } from 'next/navigation'
import { getPaginationRowModel } from '@tanstack/react-table'
import { TokenImage } from '@/components/TokenImage'
import Big from '@/lib/big'
import { HolderCard, HolderColumn, ListSwitch } from './components'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'

interface HolderData {
  holder: {
    address: string
    rns: string
  }
  quantity: string
}

export const HoldersSection = () => {
  const prices = useGetSpecificPrices()
  // Fetch st rif holders
  const { currentResults, isLoading, isError, paginationElement } = useFetchTokenHolders(STRIF_ADDRESS)

  const holders: HolderData[] = currentResults.map(({ address, value }) => ({
    holder: {
      address: address.hash,
      rns: address.ens_domain_name,
    },
    quantity: value,
  }))

  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])
  const [isGridMode, setIsGridMode] = useState(false)

  const searchParams = useSearchParams()

  // Convert 1-indexed URL page to 0-indexed internal page
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: Math.max(parseInt(searchParams?.get('page') ?? '1') - 1, 0),
    pageSize: 10,
  }))

  // Table data definition helper
  const { accessor } = createColumnHelper<(typeof holders)[number]>()
  const columns = [
    accessor('holder', {
      id: 'holder',
      header: 'Holder',
      cell: ({ row }) => <HolderColumn address={row.original.holder.address} rns={row.original.holder.rns} />,
      enableSorting: false,
    }),
    accessor('quantity', {
      id: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="flex flex-row items-center">
          <Span variant="body">{formatAmount(row.original.quantity)}</Span>
          <TokenImage size={16} symbol="RIF" className="ml-2" />
          <Span variant="tag-s" className="ml-1">
            stRIF
          </Span>
        </div>
      ),
      enableSorting: false,
      sortingFn: (a, b) => {
        const quantityA = Big(a.original.quantity)
        const quantityB = Big(b.original.quantity)

        return quantityA.cmp(quantityB)
      },
    }),
  ]

  // create table data model which is passed to the Table UI component
  const table = useReactTable({
    columns,
    data: holders,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
    // Prevent pagination reset on data change
    autoResetPageIndex: false,
  })

  return (
    <div className="bg-bg-80 p-6">
      <div className="flex flex-row justify-between">
        <Header variant="h3" className="mb-4">
          HOLDERS
        </Header>
        <ListSwitch isGridMode={isGridMode} setIsGridMode={setIsGridMode} />
      </div>

      {isError && (
        <ErrorMessageAlert message="An error occurred loading Token Holders. Please try again shortly." />
      )}
      {!isError && holders?.length > 0 && (
        <>
          {!isGridMode ? (
            <GridTable table={table} className="mt-8" rowStyles="py-2" />
          ) : (
            <div className="grid gap-2 grid-cols-4 mt-8">
              {holders.map(h => (
                <HolderCard
                  key={h.holder.address}
                  amount={h.quantity}
                  address={h.holder.address}
                  rns={h.holder.rns}
                  price={prices[RIF]?.price}
                />
              ))}
            </div>
          )}
          {paginationElement}
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
