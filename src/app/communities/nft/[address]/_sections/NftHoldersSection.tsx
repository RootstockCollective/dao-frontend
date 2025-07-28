'use client'

import { Address } from 'viem'
import { useFetchNftHolders } from '@/shared/hooks/useFetchNftHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { truncateMiddle } from '@/lib/utils'
import { useState } from 'react'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { Paragraph, Header, Span } from '@/components/TypographyNew'
import { ViewIconHandler, type ViewState } from './ViewIconHandler'
import {
  createColumnHelper,
  type SortingState,
  getSortedRowModel,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { NftHoldersTable } from '../_components/NftHoldersTable'
import { NftCard } from '../_components/NftCard'
import { Pagination } from '@/components/Pagination'
import { type NftHolderItem } from '@/app/user/Balances/types'
import { NftHolderTableCell } from '../_components/NftHolderTableCell'

export const NftHoldersSection = ({ address }: { address: Address }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState(() => ({
    pageIndex: 0,
    pageSize: 15,
  }))
  const [view, setView] = useState<ViewState>('table')
  const { currentResults, isLoading, isError, allItems } = useFetchNftHolders(address)
  // Define NFT holders table
  const { accessor } = createColumnHelper<(typeof currentResults)[number]>()
  const columns = [
    accessor(({ ens_domain_name, owner }) => ens_domain_name ?? truncateMiddle(owner, 4, 4), {
      header: 'Holder',
      cell: ({ row, cell }) => {
        const icon = applyPinataImageOptions(row.original.image_url, {
          width: 120,
          height: 120,
        })
        return <NftHolderTableCell icon={icon} row={row} cell={cell} />
      },
    }),
    accessor('id', {
      header: 'ID Number',
      cell: ({ cell }) => <Paragraph>{cell.getValue()}</Paragraph>,
    }),
  ]
  const table = useReactTable({
    columns,
    data: allItems,
    state: {
      sorting,
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  })

  // Early return: If not loading and either there are no holders or there's an error, don't render anything
  if (!isLoading && (currentResults.length === 0 || isError)) {
    return null
  }

  return (
    <div className="relative px-6 pt-4 pb-10 bg-bg-80 rounded overflow-hidden">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <Header caps className="text-xl inline mr-2">
            Holders
          </Header>
          {currentResults.length > 0 && <Span className="text-lg text-bg-0">{currentResults.length}</Span>}
        </div>
        {currentResults.length > 0 && <ViewIconHandler view={view} onChangeView={setView} />}
      </div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && currentResults.length > 0 && (
        <>
          {view === 'table' && <NftHoldersTable table={table} />}
          {view === 'images' && (
            <NftCardView nfts={table.getRowModel().rows.map(({ original }) => original)} />
          )}
          <div className="mt-6">
            <Pagination pagination={pagination} setPagination={setPagination} data={allItems} table={table} />
          </div>
        </>
      )}
    </div>
  )
}

const NftCardView = ({ nfts }: { nfts: NftHolderItem[] }) => (
  <div className="grid grid-cols-4 gap-2 grid-flow-dense">
    {nfts.map(({ image_url, id, owner, ens_domain_name }, i) => (
      <NftCard
        key={id}
        image={image_url}
        id={id}
        ensDomain={ens_domain_name}
        holderAddress={owner}
        format={i % 6 ? 'small' : 'big'}
      />
    ))}
  </div>
)
