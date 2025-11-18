'use client'

import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { GridTable } from '@/components/Table'
import { MetricsContainer } from '@/components/containers'
import { Header } from '@/components/Typography'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessageAlert } from '@/components/ErrorMessageAlert/ErrorMessageAlert'
import { useStrategies, StrategyInfo } from '../hooks/useStrategies'
import { formatSymbol, formatApy } from '@/app/shared/formatter'
import { truncateMiddle } from '@/lib/utils'
import { USDRIF } from '@/lib/constants'
import { CopyButton } from '@/components/CopyButton'
import { Paragraph } from '@/components/Typography'
import { CircularProgress } from './CircularProgress'

/**
 * Component displaying strategies information for the vault
 */
export const StrategiesInfo = () => {
  const { strategies, isLoading, error } = useStrategies()
  const [sorting, setSorting] = useState<SortingState>([])

  // Table data definition helper
  const { accessor } = createColumnHelper<StrategyInfo>()

  const columns = useMemo(
    () => [
      accessor('name', {
        id: 'name',
        header: 'Strategy Address', // @TODO this should be strategy name - fetch from blockscout
        cell: ({ row }) => (
          <CopyButton copyText={row.original.address} className="flex items-center">
            <Paragraph>{truncateMiddle(row.original.address, 10, 10)}</Paragraph>
          </CopyButton>
        ),
        enableSorting: false,
        meta: {
          width: '1.5fr',
        },
      }),
      accessor('funds', {
        id: 'funds',
        header: 'Funds',
        cell: ({ row }) => (
          <Paragraph>{isLoading ? '...' : formatSymbol(row.original.funds, USDRIF)}</Paragraph>
        ),
        enableSorting: true,
        sortingFn: (a, b) => {
          if (a.original.funds > b.original.funds) return 1
          if (a.original.funds < b.original.funds) return -1
          return 0
        },
        meta: {
          width: '1.2fr',
        },
      }),
      accessor('percentageAllocated', {
        id: 'percentageAllocated',
        header: '% Allocated',
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {isLoading ? (
              <Paragraph>...</Paragraph>
            ) : (
              <CircularProgress percentage={row.original.percentageAllocated} size="small" />
            )}
          </div>
        ),
        enableSorting: true,
        sortingFn: (a, b) => {
          if (a.original.percentageAllocated > b.original.percentageAllocated) return 1
          if (a.original.percentageAllocated < b.original.percentageAllocated) return -1
          return 0
        },
        meta: {
          width: '1fr',
        },
      }),
      accessor('estimatedApy', {
        id: 'estimatedApy',
        header: 'Est. APY',
        cell: ({ row }) => (
          <Paragraph>{isLoading ? '...' : `${formatApy(row.original.estimatedApy)}%`}</Paragraph>
        ),
        enableSorting: true,
        sortingFn: (a, b) => {
          if (a.original.estimatedApy > b.original.estimatedApy) return 1
          if (a.original.estimatedApy < b.original.estimatedApy) return -1
          return 0
        },
        meta: {
          width: '1fr',
        },
      }),
    ],
    [isLoading],
  )

  // Create table data model
  const table = useReactTable({
    columns,
    data: strategies,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <MetricsContainer className="bg-v3-bg-accent-80">
      <div className="flex flex-col gap-6 w-full">
        <Header variant="h3">Strategies</Header>

        {error && (
          <ErrorMessageAlert message="An error occurred loading strategies information. Please try again shortly." />
        )}

        {!error && strategies.length > 0 && (
          <GridTable table={table} className="mt-4" rowStyles="py-2" data-testid="StrategiesTable" />
        )}

        {!error && !isLoading && strategies.length === 0 && (
          <Paragraph className="text-v3-text-secondary">No strategies found.</Paragraph>
        )}

        {isLoading && <LoadingSpinner />}
      </div>
    </MetricsContainer>
  )
}
