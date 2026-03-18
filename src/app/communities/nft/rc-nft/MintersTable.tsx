'use client'

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

import { Button } from '@/components/Button'
import { CopyButton } from '@/components/CopyButton'
import { Pagination } from '@/components/Pagination'
import { GridTable } from '@/components/Table'
import { Tooltip } from '@/components/Tooltip'
import { Header } from '@/components/Typography'
import { truncateMiddle } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { useRcNft } from './useRcNft'

/** Table component displaying whitelisted minter addresses with ability to revoke minter roles. */
export function MintersTable() {
  const isDesktop = useIsDesktop()
  const { hasGuardRole, minters, revokeMinterRole } = useRcNft()
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { accessor, display } = createColumnHelper<(typeof minters)[number]>()

  const mintersColumns = [
    accessor('address', {
      header: 'Minter address',
      cell: cell => {
        const address = cell.getValue()
        return (
          <CopyButton className="whitespace-nowrap" copyText={address}>
            {truncateMiddle(address, 10, 10)}
          </CopyButton>
        )
      },
    }),
    accessor('rns', {
      header: 'RNS domain',
      cell: cell => cell.getValue() ?? <p className="pl-10">—</p>,
    }),
    display({
      header: 'Revoke role',
      cell: ({ row }) => {
        const { address } = row.original
        return (
          <Tooltip text={hasGuardRole ? `Remove ${truncateMiddle(address)}` : 'You need guard permissions'}>
            <Button
              disabled={!hasGuardRole}
              onClick={() => revokeMinterRole(address)}
              variant="secondary-outline"
              className="w-fit whitespace-nowrap"
            >
              Revoke minter
            </Button>
          </Tooltip>
        )
      },
    }),
  ]

  const mintersTable = useReactTable({
    data: minters,
    columns: mintersColumns,
    state: {
      pagination,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
  })

  return (
    <div>
      <Header variant="h3" className="mb-4 text-brand-rootstock-purple">
        Whitelisted addresses ({minters.length > 0 ? `${minters.length} minters total` : 'No minters found'})
      </Header>
      <GridTable
        stackFirstColumn={!isDesktop}
        rowStyles="hover:bg-transparent hover:text-text-100"
        table={mintersTable}
      />

      {minters.length > pagination.pageSize && (
        <div className="mt-4">
          <Pagination
            pagination={pagination}
            setPagination={setPagination}
            data={minters}
            table={mintersTable}
            pageSizes={[5, 10, 20, 50]}
          />
        </div>
      )}
    </div>
  )
}
