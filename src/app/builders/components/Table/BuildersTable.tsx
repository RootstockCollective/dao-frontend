'use client'

import { Builder } from '@/app/collective-rewards/types'
import TablePager from '@/components/TableNew/TablePager'
import {
  Column,
  RowData,
  Sort,
  useTableActionsContext,
  useTableContext,
  withTableContext,
} from '@/shared/context'
import { HtmlHTMLAttributes, Suspense, useEffect, useState } from 'react'
import { Address } from 'viem'
import { TableColumnDropdown } from '../TableColumnDropdown'
import { BuilderDataRow } from './BuilderDataRow'
import { BuilderHeaderRow } from './BuilderHeaderRow'

const PAGE_SIZE = 3
const ACTIONS_HEADER_SHOW_THRESHOLD = 5

// Column types and ids definitions
const COLUMN_TYPES = ['builder', 'backing', 'change', 'rewards', 'allocations', 'actions'] as const
const COLUMN_IDS = [
  'builder',
  'backing',
  'rewards_percentage',
  'rewards_past_cycle',
  'rewards_upcoming',
  'allocations',
  'actions',
] as const
export type ColumnType = (typeof COLUMN_TYPES)[number]
export type ColumnId = (typeof COLUMN_IDS)[number]

const isColumnId = (id: string): id is ColumnId => COLUMN_IDS.includes(id as ColumnId)
const isColumnType = (type: string): type is ColumnType => COLUMN_TYPES.includes(type as ColumnType)
const isColumn = (id: string, type: string): boolean => isColumnId(id) && isColumnType(type)

const tmp = () => <div className="flex-[1.75]">test</div>

// FIXME: Leave to the end to fix the dynamic width of the columns so that the actions column expands when other columns are hidden without affecting the builder column.
export const COLUMN_WIDTHS: Record<ColumnId, HtmlHTMLAttributes<HTMLTableCellElement>['className']> = {
  builder: 'grow-3 shrink-2 basis-6 pl-4',
  backing: 'grow-1 shrink-1 basis-6 pl-4',
  rewards_percentage: 'grow-1 shrink-1 basis-6 pl-4',
  rewards_past_cycle: 'grow-1 shrink-1 basis-6 pl-4',
  rewards_upcoming: 'grow-1 shrink-1 basis-6 pl-4',
  allocations: 'grow-1 shrink-0 basis-6 pl-4',
  actions: 'grow-1 shrink-0 basis-6 pl-4',
}

export const DEFAULT_HEADERS: Column<ColumnId, ColumnType>[] = [
  {
    id: 'builder',
    type: 'builder',
    hidden: false,
    sortable: true,
  },
  {
    id: 'backing',
    type: 'backing',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_percentage',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_past_cycle',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'rewards_upcoming',
    type: 'rewards',
    hidden: false,
    sortable: true,
  },
  {
    id: 'allocations',
    type: 'allocations',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    type: 'actions',
    hidden: true,
    sortable: false,
  },
]

const BuildersTable = () => {
  const [pageStart, setPageStart] = useState(0)
  const [pageEnd, setPageEnd] = useState(10)

  const { columns, rows, sort } = useTableContext<ColumnId, ColumnType>()
  const dispatch = useTableActionsContext<ColumnId, ColumnType>()
  const {
    data: builderCount,
    isLoading: isLoadingBuilderCount,
    error: errorBuilderCount,
  } = useGetBuilderCount()
  const {
    data: builders,
    isLoading: isLoadingBuilders,
    error: errorBuilders,
  } = useGetBuilders(pageStart, pageEnd, sort)

  /**
   * Set the action column header to show if the allocations column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
   */
  useEffect(() => {
    const isAllocationsHidden = columns.find(col => col.id == 'allocations')?.hidden
    const isActionsHidden = columns.find(col => col.id == 'actions')?.hidden
    if (isAllocationsHidden && isActionsHidden) {
      dispatch({
        type: 'TOGGLE_COLUMN_VISIBILITY',
        payload: 'actions',
      })
    }
    if (!isAllocationsHidden && !isActionsHidden) {
      dispatch({
        type: 'TOGGLE_COLUMN_VISIBILITY',
        payload: 'actions',
      })
    }
  }, [columns])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
  }, [])

  useEffect(() => {
    setPageEnd(pageStart + PAGE_SIZE)
  }, [pageStart])

  useEffect(() => {
    if (builders) {
      dispatch({
        type: 'SET_ROWS',
        payload: Object.entries(builders).map(([address, builder]) => ({
          id: address as ColumnId,
          ...builder,
        })) as unknown as RowData<ColumnId>[], // TODO: fix this type
      })
    }
  }, [builders])

  if (!columns.length) {
    return <Suspense>Loading table... </Suspense>
  }

  return (
    <>
      <TableColumnDropdown className="self-end" />
      {/* <BuilderFilterDropdown onSelected={() => {}} /> FIXME: add onSelected */}
      <div className="w-full">
        <table className="w-full table-fixed">
          <thead>
            <BuilderHeaderRow columns={columns} />
          </thead>
          <tbody>
            {rows.map(row => (
              <BuilderDataRow key={row.id} row={row} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
      <TablePager
        pageSize={pageEnd - pageStart}
        totalItems={builderCount || 0}
        onPageChange={() => {
          setPageEnd(prev => prev + PAGE_SIZE)
        }}
        mode="cyclic"
        pagedItemName="builders"
      />
    </>
  )
}

// Mock hooks that simulate useQuery behavior
const useGetBuilders = (from: number, to: number, sort: Sort<string>) => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<Record<Address, Builder> | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!from && !to) return

    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        // Simulate sorting and pagination
        let buildersArray = Object.entries(mockBuilders)

        // Apply sorting if sort is provided
        if (sort?.by && sort?.direction) {
          buildersArray = buildersArray.sort(([, a], [, b]) => {
            let aValue: any
            let bValue: any

            // Sort by different fields based on column
            switch (sort.by) {
              case 'builder':
                aValue = a.builderName || ''
                bValue = b.builderName || ''
                break
              case 'backing':
                aValue = a.backerRewardPercentage?.active || 0
                bValue = b.backerRewardPercentage?.active || 0
                break
              case 'rewards_percentage':
                aValue =
                  Number(a.backerRewardPercentage?.active ?? 0) -
                  Number(a.backerRewardPercentage?.previous ?? 0)
                bValue =
                  Number(b.backerRewardPercentage?.active ?? 0) -
                  Number(b.backerRewardPercentage?.previous ?? 0)
                break
              case 'rewards_past_cycle':
                aValue = Number(a.backerRewardPercentage?.previous ?? 0)
                bValue = Number(b.backerRewardPercentage?.previous ?? 0)
                break
              case 'rewards_upcoming':
                aValue = Number(a.backerRewardPercentage?.next ?? 0)
                bValue = Number(b.backerRewardPercentage?.next ?? 0)
                break
              case 'allocations':
                aValue = a.allocations || 0
                bValue = b.allocations || 0
                break
              default:
                aValue = a.builderName || ''
                bValue = b.builderName || ''
            }

            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }

            // Handle number comparison
            return sort.direction === 'asc' ? aValue - bValue : bValue - aValue
          })
        }

        // Apply pagination
        const paginatedBuilders = buildersArray.slice(from, from + to)
        const paginatedData = Object.fromEntries(paginatedBuilders) as Record<Address, Builder>

        setData(paginatedData)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }, 500) // 500ms delay to simulate API call

    return () => clearTimeout(timer)
  }, [from, to, sort]) // Added sort to dependencies

  return { data, isLoading, error }
}

const useGetBuilderCount = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<number | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      try {
        setData(Object.keys(mockBuilders).length)
        setIsLoading(false)
      } catch (err) {
        setError(err as Error)
        setIsLoading(false)
      }
    }, 300) // 300ms delay to simulate API call

    return () => clearTimeout(timer)
  }, [])

  return { data, isLoading, error }
}

export default withTableContext(BuildersTable)

const mockBuilders: Record<
  Address,
  Builder & { allocations: bigint; rewards: { next: { rbtc: bigint; rif: bigint; usd: bigint } } }
> = {
  '0x1234567890123456789012345678901234567890': {
    address: '0x1234567890123456789012345678901234567890',
    builderName: 'Builder 1',
    proposal: {
      id: 1n,
      name: 'Proposal 1',
      description: 'Description 1',
      date: '2021-01-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x1234567890123456789012345678901234567890',
    backerRewardPercentage: {
      previous: 10n,
      next: 15n,
      cooldown: 7n,
      active: 12n,
    },
    allocations: 850000000000000000n, // 85%
    rewards: {
      next: {
        rbtc: 2500000000000000000n, // 2.5 RBTC
        rif: 5000000000000000000n, // 5 RIF
        usd: 5000000000000000000n, // $5,000
      },
    },
  },
  '0x2345678901234567890123456789012345678901': {
    address: '0x2345678901234567890123456789012345678901',
    builderName: 'Builder 2',
    proposal: {
      id: 2n,
      name: 'Proposal 2',
      description: 'Description 2',
      date: '2021-02-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x2345678901234567890123456789012345678901',
    backerRewardPercentage: {
      previous: 18n,
      next: 12n,
      cooldown: 5n,
      active: 10n,
    },
    allocations: 750000000000000000n, // 75%
    rewards: {
      next: {
        rbtc: 1800000000000000000n, // 1.8 RBTC
        rif: 3600000000000000000n, // 3.6 RIF
        usd: 3600000000000000000n, // $3,600
      },
    },
  },
  '0x3456789012345678901234567890123456789012': {
    address: '0x3456789012345678901234567890123456789012',
    builderName: 'Builder 3',
    proposal: {
      id: 3n,
      name: 'Proposal 3',
      description: 'Description 3',
      date: '2021-03-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: false,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x3456789012345678901234567890123456789012',
    backerRewardPercentage: {
      previous: 15n,
      next: 18n,
      cooldown: 8n,
      active: 15n,
    },
    allocations: 600000000000000000n, // 60%
    rewards: {
      next: {
        rbtc: 1200000000000000000n, // 1.2 RBTC
        rif: 2400000000000000000n, // 2.4 RIF
        usd: 2400000000000000000n, // $2,400
      },
    },
  },
  '0x4567890123456789012345678901234567890123': {
    address: '0x4567890123456789012345678901234567890123',
    builderName: 'Builder 4',
    proposal: {
      id: 4n,
      name: 'Proposal 4',
      description: 'Description 4',
      date: '2021-04-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    gauge: '0x4567890123456789012345678901234567890123',
    backerRewardPercentage: {
      previous: 15n,
      next: 20n,
      cooldown: 10n,
      active: 18n,
    },
    allocations: 450000000000000000n, // 45%
    rewards: {
      next: {
        rbtc: 900000000000000000n, // 0.9 RBTC
        rif: 1800000000000000000n, // 1.8 RIF
        usd: 1800000000000000000n, // $1,800
      },
    },
  },
  '0x5678901234567890123456789012345678901234': {
    address: '0x5678901234567890123456789012345678901234',
    builderName: 'Builder 5',
    proposal: {
      id: 5n,
      name: 'Proposal 5',
      description: 'Description 5',
      date: '2021-05-01',
    },
    stateFlags: {
      activated: false,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    gauge: '0x5678901234567890123456789012345678901234',
    backerRewardPercentage: {
      previous: 9n,
      next: 14n,
      cooldown: 6n,
      active: 12n,
    },
    allocations: 300000000000000000n, // 30%
    rewards: {
      next: {
        rbtc: 600000000000000000n, // 0.6 RBTC
        rif: 1200000000000000000n, // 1.2 RIF
        usd: 1200000000000000000n, // $1,200
      },
    },
  },
  '0x6789012345678901234567890123456789012345': {
    address: '0x6789012345678901234567890123456789012345',
    builderName: 'Builder 6',
    proposal: {
      id: 6n,
      name: 'Proposal 6',
      description: 'Description 6',
      date: '2021-06-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: true,
      revoked: false,
    },
    gauge: '0x6789012345678901234567890123456789012345',
    backerRewardPercentage: {
      previous: 11n,
      next: 16n,
      cooldown: 7n,
      active: 14n,
    },
    allocations: 250000000000000000n, // 25%
    rewards: {
      next: {
        rbtc: 500000000000000000n, // 0.5 RBTC
        rif: 1000000000000000000n, // 1.0 RIF
        usd: 1000000000000000000n, // $1,000
      },
    },
  },
  '0x7890123456789012345678901234567890123456': {
    address: '0x7890123456789012345678901234567890123456',
    builderName: 'Builder 7',
    proposal: {
      id: 7n,
      name: 'Proposal 7',
      description: 'Description 7',
      date: '2021-07-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: true,
    },
    gauge: '0x7890123456789012345678901234567890123456',
    backerRewardPercentage: {
      previous: 13n,
      next: 19n,
      cooldown: 9n,
      active: 16n,
    },
    allocations: 150000000000000000n, // 15%
    rewards: {
      next: {
        rbtc: 300000000000000000n, // 0.3 RBTC
        rif: 600000000000000000n, // 0.6 RIF
        usd: 600000000000000000n, // $600
      },
    },
  },
  '0x8901234567890123456789012345678901234567': {
    address: '0x8901234567890123456789012345678901234567',
    builderName: 'Builder 8',
    proposal: {
      id: 8n,
      name: 'Proposal 8',
      description: 'Description 8',
      date: '2021-08-01',
    },
    stateFlags: {
      activated: true,
      kycApproved: false,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    gauge: '0x8901234567890123456789012345678901234567',
    backerRewardPercentage: {
      previous: 7n,
      next: 11n,
      cooldown: 4n,
      active: 9n,
    },
    allocations: 50000000000000000n, // 5%
    rewards: {
      next: {
        rbtc: 1000000000000000000n,
        rif: 1000000000000000000n,
        usd: 1000000000000000000n,
      },
    },
  },
}
