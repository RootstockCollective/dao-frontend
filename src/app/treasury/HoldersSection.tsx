import { GridTable, Table } from '@/components/Table'
import { Header } from '@/components/TypographyNew'
import { EXPLORER_URL, STRIF_ADDRESS } from '@/lib/constants'
import { ExternalLinkIcon } from '@/components/Icons'
import { useFetchTokenHolders } from '@/app/treasury/hooks/useFetchTokenHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { formatNumberWithCommas } from '@/lib/utils'
import { formatEther } from 'viem'
import { Span } from '@/components/TypographyNew'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Pagination } from '@/components/Paginaton'
import { useState } from 'react'
import { PaginationState } from '@tanstack/react-table'
import { useSearchParams } from 'next/navigation'
import { getPaginationRowModel } from '@tanstack/react-table'
import { TokenImage } from '@/components/TokenImage'
import Big from 'big.js'

interface HolderColumnProps {
  address: string
  rns?: string
}
const HolderColumn = ({ address, rns }: HolderColumnProps) => {
  return (
    <a
      href={`${EXPLORER_URL}/address/${address}`}
      target="_blank"
      className="flex items-center gap-1.5 text-white"
    >
      <Jdenticon className="rounded-full bg-white mr-1" value={address} size="30" />
      <Span className="underline text-left overflow-hidden whitespace-nowrap text-[14px] text-text-primary">
        {rns?.split('.')[0] || address}
      </Span>
    </a>
  )
}

interface HolderData {
  holder: {
    address: string
    rns: string
  }
  quantity: string
}

export const HoldersSection = () => {
  // Fetch st rif holders
  const { currentResults, isLoading, isError } = useFetchTokenHolders(STRIF_ADDRESS)

  const holders: HolderData[] = currentResults.map(({ address, value }) => ({
    // holder: <HolderColumn address={address.hash} rns={address.ens_domain_name} />,
    holder: {
      address: address.hash,
      rns: address.ens_domain_name,
    },
    quantity: formatNumberWithCommas(formatEther(BigInt(value)).split('.')[0]),
  }))

  // React-table sorting state
  const [sorting, setSorting] = useState<SortingState>([])

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
    }),
    accessor('quantity', {
      id: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <div className="flex flex-row">
          <Span variant="body-s">{row.original.quantity}</Span>
          <TokenImage size={16} symbol="RIF" className="ml-2" />
          <Span variant="tag-s" className="ml-1">
            stRIF
          </Span>
        </div>
      ),
      sortingFn: (a, b) => {
        const quantityA = Big(a.original.quantity.split(',').join(''))
        const quantityB = Big(b.original.quantity.split(',').join(''))

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
      <Header variant="h3" className="mb-4">
        HOLDERS
      </Header>
      {isError && (
        <ErrorMessageAlert message="An error occurred loading Token Holders. Please try again shortly." />
      )}
      {!isError && holders?.length > 0 && (
        <>
          <GridTable table={table} className="mt-8" rowStyles="py-2" />
          <Pagination pagination={pagination} setPagination={setPagination} data={holders} table={table} />
        </>
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  )
}
