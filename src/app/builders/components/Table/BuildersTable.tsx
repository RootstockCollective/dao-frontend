'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { Token, useGetBuildersRewards } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import { Builder } from '@/app/collective-rewards/types'
import {
  isBuilderActive,
  isBuilderDeactivated,
  isBuilderKycRevoked,
  isBuilderPaused,
} from '@/app/collective-rewards/utils'
import TablePager from '@/components/TableNew/TablePager'
import { getTokens } from '@/lib/tokens'
import {
  Row,
  SelectedRows,
  usePricesContext,
  useTableActionsContext,
  useTableContext,
  withTableContext,
} from '@/shared/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import BuilderFilterDropdown, { BuilderFilterOptionId } from '../../BuilderFilterDropdown'
import { BuilderDataRow, convertDataToRowData } from './BuilderDataRow'
import { BuilderHeaderRow } from './BuilderHeaderRow'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BuilderTable.config'
import { Action } from './Cell/ActionCell'

// --- Filter builders by state ---
const filterInactive = (builder: Builder) => !isBuilderActive(builder.stateFlags)
const filterActive = (builder: Builder) => isBuilderActive(builder.stateFlags)
const filterDeactivated = (builder: Builder) =>
  isBuilderDeactivated(builder) || isBuilderKycRevoked(builder.stateFlags)
const filterRevoked = (builder: Builder) => Boolean(builder.stateFlags?.revoked)
const filterPaused = (builder: Builder) => isBuilderPaused(builder.stateFlags)
const filterInProgress = (builder: Builder) => !isBuilderActive(builder.stateFlags)

const filterMap: Record<BuilderFilterOptionId, (builder: Builder) => boolean> = {
  active: filterActive,
  inactive: filterInactive,
  deactivated: filterDeactivated,
  revoked: filterRevoked,
  paused: filterPaused,
  'in-progress': filterInProgress,
  all: () => true,
}

// FIXME: this is a temporary solution to filter builders by state.
const useFilteredBuilders = (tokens: { [token: string]: Token }, filterOption: BuilderFilterOptionId) => {
  const { data: buildersRewardsData, isLoading, error } = useGetBuildersRewards(tokens)
  const filteredBuilders = useMemo(
    () => buildersRewardsData?.filter(filterMap[filterOption]),
    [buildersRewardsData, filterOption],
  )

  return { data: filteredBuilders, isLoading, error }
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
const BuildersTable = () => {
  const [pageEnd, setPageEnd] = useState(10)
  const [filterOption, setFilterOption] = useState<BuilderFilterOptionId>('all')

  const { address: userAddress } = useAccount()

  const dispatch = useTableActionsContext<ColumnId>()

  const tokens = useMemo(() => getTokens(), [])
  const { data: buildersRewardsData, isLoading, error } = useFilteredBuilders(tokens, filterOption)

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
      enabled: !!userAddress && !!buildersRewardsData.length,
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
        hidden: !userAddress,
      },
    })
  }, [userAddress])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
    setPageEnd(prev => prev + PAGE_SIZE)
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

  const handleFilterChange = (filterOption: BuilderFilterOptionId) => {
    setFilterOption(filterOption)
  }

  return (
    <>
      <BuilderFilterDropdown onSelected={handleFilterChange} />
      {/* FIXME: the filter is meant to be aligned with the section title */}
      <Table />
      <TablePager
        pageSize={pageEnd}
        totalItems={buildersRewardsData?.length || 0}
        onPageChange={() => {
          setPageEnd(prev => prev + PAGE_SIZE)
        }}
        mode="cyclic"
        pagedItemName="builders"
      />
    </>
  )
}

export default withTableContext(BuildersTable)
