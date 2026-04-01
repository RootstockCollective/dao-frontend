'use client'

import type { Address } from 'viem'
import { useFetchNftHolders } from '@/shared/hooks/useFetchNftHolders'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { cn, truncateMiddle } from '@/lib/utils'
import { useState } from 'react'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { Paragraph, Header, Span } from '@/components/Typography'
import { ViewIconHandler } from './ViewIconHandler'
import { useBadgeView } from './useBadgeView'
import {
  createColumnHelper,
  getSortedRowModel,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { NftHoldersTable } from '../_components/NftHoldersTable'
import { NftCard } from '../_components/NftCard'
import type { NftHolderItem } from '@/app/user/Balances/types'
import { NftHolderTableCell } from '../_components/NftHolderTableCell'
import { TablePager } from '@/components/TableNew/TablePager'

const STEP = 15

export const NftHoldersSection = ({ address }: { address: Address }) => {
  const [pagination, setPagination] = useState(() => ({
    pageIndex: 0,
    pageSize: STEP,
  }))
  const { view } = useBadgeView()
  const { isLoading, isError, allItems } = useFetchNftHolders(address)
  // Define NFT holders table
  const { accessor } = createColumnHelper<NftHolderItem>()
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
      cell: ({ cell }) => (
        <Paragraph className="text-right md:text-left">
          <span className="md:hidden">ID#&nbsp;</span>
          <span>{cell.getValue()}</span>
        </Paragraph>
      ),
    }),
  ]
  const table = useReactTable({
    columns,
    data: allItems,
    state: { pagination },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  })

  // Early return: If not loading and either there are no holders or there's an error, don't render anything
  if (!isLoading && (allItems.length === 0 || isError)) {
    return null
  }

  return (
    <div className="relative px-4 pt-6 md:pt-4 pb-8 md:pb-10 bg-bg-80 rounded overflow-hidden">
      <div className="mb-6 md:mb-10 flex justify-between items-center">
        <div>
          <Header caps className="text-xl md:text-xl inline mr-2">
            Holders
          </Header>
          {allItems.length > 0 && (
            <Span variant="body-l" className="text-bg-0">
              {allItems.length}
            </Span>
          )}
        </div>
        {allItems.length > 0 && <ViewIconHandler />}
      </div>
      {isLoading && <LoadingSpinner />}
      {!isLoading && allItems.length > 0 && (
        <>
          {view === 'table' && <NftHoldersTable table={table} />}
          {view === 'images' && (
            <NftCardView nfts={table.getRowModel().rows.map(({ original }) => original)} />
          )}
          <TablePager
            pageSize={STEP}
            totalItems={table.getPrePaginationRowModel().rows.length}
            pagedItemName="holders"
            mode="expandable"
            onPageChange={({ end }) => setPagination({ pageIndex: 0, pageSize: end })}
            className="mt-5 md:mt-6 [&_button]:bg-bg-80 [&_button]:border-bg-0"
          />
        </>
      )}
    </div>
  )
}

const NftCardView = ({ nfts }: { nfts: NftHolderItem[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 grid-flow-dense">
    {nfts.map(({ image_url, id, owner, ens_domain_name }, i) => (
      <NftCard
        key={id}
        image={image_url}
        id={id}
        ensDomain={ens_domain_name}
        holderAddress={owner}
        className={cn('col-span-1 row-span-1 md:col-span-2 md:row-span-2', {
          'md:col-span-1 md:row-span-1': i % 6,
        })}
      />
    ))}
  </div>
)
