'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Builder, BuilderRewardsSummary } from '@/app/collective-rewards/types'
import {
  isBuilderDeactivated,
  isBuilderKycRevoked,
  isBuilderPaused,
  isBuilderSelfPaused,
} from '@/app/collective-rewards/utils'
import TablePager from '@/components/TableNew/TablePager'
import { getTokens } from '@/lib/tokens'
import {
  Row,
  SelectedRows,
  usePricesContext,
  useTableActionsContext,
  useTableContext,
} from '@/shared/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderFilterOptionId } from '../../BuilderFilterDropdown'
import { BuilderDataRow, convertDataToRowData } from './BuilderDataRow'
import { BuilderHeaderRow } from './BuilderHeaderRow'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BuilderTable.config'
import { Action } from './Cell/ActionCell'
import { useGetBuilderRewardsSummary } from '../../hooks/useGetBuilderRewardsSummary'
import { isActive } from './utils'
import { Token } from '@/app/collective-rewards/rewards'

// --- Filter builders by state ---
const filterActive = (builder: Builder) => isActive(builder.stateFlags)
const filterDeactivated = (builder: Builder) => isBuilderDeactivated(builder)
const filterKycRevoked = (builder: Builder) => isBuilderKycRevoked(builder.stateFlags)
const filterPaused = (builder: Builder) =>
  isBuilderPaused(builder.stateFlags) || isBuilderSelfPaused(builder.stateFlags)
const filterInProgress = (builder: Builder) => !isActive(builder.stateFlags)

const filterMap: Record<BuilderFilterOptionId, (builder: Builder) => boolean> = {
  active: filterActive,
  deactivated: filterDeactivated,
  revoked: filterKycRevoked,
  paused: filterPaused,
  inProgress: filterInProgress,
  all: () => true,
}

// FIXME: this is a temporary solution to filter builders by state.
type PagedFilter = {
  tokens: { [token: string]: Token }
  filterOption: BuilderFilterOptionId
  pageOptions: { start: number; end: number }
}
const usePagedFilteredBuildersRewards = ({
  tokens,
  filterOption,
  pageOptions,
}: PagedFilter): {
  data: { pagedRewards: BuilderRewardsSummary[]; totalRewards: number }
  isLoading: boolean
  error: Error | null
} => {
  const { data: buildersRewardsData, isLoading, error } = useGetBuilderRewardsSummary(tokens)
  const data = useMemo(() => {
    const filtered = buildersRewardsData?.filter(filterMap[filterOption])
    const totalRewards = filtered?.length ?? 0
    const pagedRewards = filtered?.slice(pageOptions.start, pageOptions.end)

    return { pagedRewards, totalRewards } as const
  }, [buildersRewardsData, filterOption, pageOptions])

  return { data, isLoading, error }
}

// --- Table component ---
export const Table = () => {
  const { rows, columns } = useTableContext<ColumnId>()

  // FIXME: I don't think we should be using this context anymore
  const {
    state: { selections },
  } = useContext(AllocationsContext)

  const dispatch = useTableActionsContext<ColumnId>()

  useEffect(() => {
    dispatch({
      type: 'SET_SELECTED_ROWS',
      payload: selections as SelectedRows<Row<ColumnId>['id']>,
    })
  }, [selections, dispatch])

  /**
   * Set the action column header to show if the allocations column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
  //  */
  useEffect(() => {
    const isAllocationsHidden = columns.find(col => col.id == 'allocations')?.hidden ?? true
    const isActionsHidden = columns.find(col => col.id == 'actions')?.hidden ?? true
    if (isAllocationsHidden === isActionsHidden) {
      dispatch({
        type: 'SET_COLUMN_VISIBILITY',
        payload: {
          columnId: 'actions',
          hidden: !isAllocationsHidden,
        },
      })
    }
  }, [columns, dispatch])

  return (
    <div className="w-full overflow-x-auto bg-v3-bg-accent-80">
      <table className="w-full min-w-[700px]">
        <thead>
          <BuilderHeaderRow />
        </thead>
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody>
            {rows.map(row => (
              <BuilderDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
}

// ---------------- Table ----------------

export const BuildersTable = ({ filterOption }: { filterOption: BuilderFilterOptionId }) => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)

  const { address: userAddress, isConnected } = useAccount()

  const dispatch = useTableActionsContext<ColumnId>()

  const tokens = useMemo(() => getTokens(), [])
  const {
    data: { pagedRewards: buildersRewardsData, totalRewards },
    isLoading,
    error,
  } = usePagedFilteredBuildersRewards({ tokens, filterOption, pageOptions: { start: 0, end: pageEnd } })

  const {
    data: allocations,
    isLoading: isAllocationsLoading,
    error: allocationsError,
  } = useReadGauges(
    {
      addresses: useMemo(
        () => buildersRewardsData?.map(builder => builder.gauge) ?? [],
        [buildersRewardsData],
      ),
      functionName: 'allocationOf',
      args: [userAddress as Address],
    },
    {
      enabled: isConnected && !!buildersRewardsData.length,
      placeholderData: [],
    },
  )
  const { prices } = usePricesContext()

  const handleAction = (action: Action, builder: Builder) => {
    console.log('handleAction', action, builder)
  }

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMN_VISIBILITY',
      payload: {
        columnId: 'backing',
        hidden: !isConnected,
      },
    })
  }, [isConnected, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(buildersRewardsData, allocations, prices, handleAction),
    })
  }, [buildersRewardsData, allocations, prices, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isLoading || isAllocationsLoading || false,
    })
  }, [isLoading, isAllocationsLoading, dispatch])

  useEffect(() => {
    if (!error && !allocationsError) return
    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message,
      })
    }
    if (allocationsError) {
      dispatch({
        type: 'SET_ERROR',
        payload: allocationsError.message,
      })
    }
  }, [error, allocationsError, dispatch])

  return (
    <>
      <Table />
      <TablePager
        pageSize={PAGE_SIZE}
        totalItems={totalRewards}
        onPageChange={({ end }) => {
          setPageEnd(end)
        }}
        pagedItemName="builders"
        mode="expandable"
      />
    </>
  )
}
