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
import { usePricesContext, useTableActionsContext, useTableContext } from '@/shared/context'
import { useReadGauges } from '@/shared/hooks/contracts'
import { Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { BuilderFilterOptionId } from '../../BuilderFilterDropdown'
import { useGetBuilderRewardsSummary } from '../../hooks/useGetBuilderRewardsSummary'
import { BuilderDataRow, convertDataToRowData } from './BuilderDataRow'
import { BuilderHeaderRow } from './BuilderHeaderRow'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BuilderTable.config'
import { Action, ActionCellProps } from './Cell/ActionCell'
import { isActive } from './utils'

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

// TODO: this is a temporary solution to filter builders by state.
type PagedFilter = {
  filterOption: BuilderFilterOptionId
  pageOptions: { start: number; end: number }
}
const usePagedFilteredBuildersRewards = ({
  filterOption,
  pageOptions,
}: PagedFilter): {
  data: { pagedRewards: BuilderRewardsSummary[]; totalRewards: number }
  isLoading: boolean
  error: Error | null
} => {
  const { data: buildersRewardsData, isLoading, error } = useGetBuilderRewardsSummary()
  const data = useMemo(() => {
    const filtered = buildersRewardsData?.filter(filterMap[filterOption])
    const totalRewards = filtered?.length ?? 0
    const pagedRewards = filtered?.slice(pageOptions.start, pageOptions.end)

    return { pagedRewards, totalRewards } as const
  }, [buildersRewardsData, filterOption, pageOptions])

  return { data, isLoading, error }
}

// ---------------- Table ----------------

export const BuildersTable = ({ filterOption }: { filterOption: BuilderFilterOptionId }) => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)

  const { address: userAddress, isConnected } = useAccount()

  const { rows, columns, selectedRows } = useTableContext<ColumnId>()
  const [actions, setActions] = useState<Action[]>([])
  const dispatch = useTableActionsContext<ColumnId>()

  const pageOptions = useMemo(() => ({ start: 0, end: pageEnd }), [pageEnd])
  const {
    data: { pagedRewards: buildersRewardsData, totalRewards },
    isLoading,
    error,
  } = usePagedFilteredBuildersRewards({ filterOption, pageOptions })

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

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(buildersRewardsData, allocations, prices),
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

  // TODO: I don't think we should be using this context anymore
  const {
    actions: { toggleSelectedBuilder },
    state: { selections },
  } = useContext(AllocationsContext)

  useEffect(() => {
    // TODO: this is a very hacky way to sync the selected rows with the allocations context.
    // One reason to remove the allocs context (it loads (pre)selections on mount) is to avoid cleaning this up.
    const selectedBuilderIds = Object.keys(selectedRows)
    const selectionValues = Object.values(selectedRows)
    const selectedAllocsValues = Object.values(selections)

    selectedBuilderIds.forEach((builderId, index) => {
      if (selectionValues[index] !== selectedAllocsValues[index]) {
        toggleSelectedBuilder(builderId as Address)
      }
    })
  }, [selections, selectedRows, toggleSelectedBuilder])

  /**
   * Set the action column header to show if the allocations column is hidden.
   * TODO: see if we can do this better to avoid re-rendering the table.
   */
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

  useEffect(() => {
    const actions = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([rowId]) => (rows.find(row => row.id === rowId)?.data.actions as ActionCellProps).actionType)
      .filter(action => action !== undefined)
    setActions(actions)
  }, [selectedRows, rows])

  useEffect(() => {
    if (!isConnected) {
      dispatch({
        type: 'SET_SELECTED_ROWS',
        payload: {},
      })
    }
  }, [isConnected, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMN_VISIBILITY',
      payload: {
        columnId: 'backing',
        hidden: !isConnected,
      },
    })
  }, [isConnected, dispatch])

  return (
    <>
      <div className="w-full overflow-x-auto bg-v3-bg-accent-80">
        <table className="w-full min-w-[700px]">
          <thead>
            <BuilderHeaderRow actions={actions} />
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
