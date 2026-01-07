'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { Builder, BuilderRewardsSummary } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils/getCombinedFiatAmount'
import { TablePager } from '@/components/TableNew'
import { usePricesContext, useTableActionsContext, useTableContext } from '@/shared/context'
import { Sort } from '@/shared/context/TableContext/types'
import { Big } from 'big.js'
import { FC, Suspense, useContext, useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { useGetBuilderRewardsSummary } from '../../hooks/useGetBuilderRewardsSummary'
import { convertDataToRowData } from './utils/builderRowUtils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { CommonComponentProps } from '@/components/commonProps'
import { DesktopBuilderRow } from './DesktopBuilderRow'
import { MobileBuilderRow } from './MobileBuilderRow'
import { BuilderFilterOptionId } from './BuilderFilterDropdown'
import { BuilderHeaderRow } from './BuilderHeaderRow'
import {
  BuilderCellDataMap,
  BuilderRowLogic,
  BuilderTable,
  ColumnId,
  DEFAULT_HEADERS,
  PAGE_SIZE,
} from './BuilderTable.config'
import { Action, ActionCellProps } from './Cell/ActionCell'
import { builderFilterMap } from './utils/builderFilters'
import { MobileStickyActionBarContent } from './MobileStickyActionBar'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { getBuilderInactiveState, isBuilderInProgress } from '@/app/collective-rewards/utils'

// Filter logic is now centralized in builderFilters.ts

// TODO: this is a temporary solution to filter builders by state.
type PagedFilter = {
  filterOption: BuilderFilterOptionId
  pageOptions: { start: number; end: number }
  sort: Sort<ColumnId>
}
const usePagedFilteredBuildersRewards = ({
  filterOption,
  pageOptions,
  sort,
}: PagedFilter): {
  data: { pagedRewards: BuilderRewardsSummary[]; totalRewards: number }
  isLoading: boolean
  error: Error | null
} => {
  const { data: buildersRewardsData, isLoading, error } = useGetBuilderRewardsSummary()
  const { builders } = useBuilderContext()

  // we want also the builders without gauges
  const allBuilders = useMemo(() => {
    const buildersRewardsDataMap = buildersRewardsData.reduce(
      (acc, builder) => {
        acc[builder.address] = builder
        return acc
      },
      {} as Record<Address, BuilderRewardsSummary>,
    )
    return builders.map(builder => ({
      ...builder,
      ...buildersRewardsDataMap[builder.address],
    }))
  }, [builders, buildersRewardsData])

  const data = useMemo(() => {
    const { columnId, direction } = sort

    const filtered = allBuilders.filter(builderFilterMap[filterOption])

    // Comparator map
    const comparators: Partial<
      Record<ColumnId, (a: BuilderRewardsSummary, b: BuilderRewardsSummary) => number>
    > = {
      builder: (a, b) => a.builderName.localeCompare(b.builderName),

      backer_rewards: (a, b) =>
        Number((a.backerRewardPct?.current ?? 0n) - (b.backerRewardPct?.current ?? 0n)),

      rewards_past_cycle: (a, b) => {
        const aValue = a.lastCycleRewards
          ? getCombinedFiatAmount([
              a.lastCycleRewards.rif.amount,
              a.lastCycleRewards.rbtc.amount,
              a.lastCycleRewards.usdrif.amount,
            ]).toNumber()
          : 0
        const bValue = b.lastCycleRewards
          ? getCombinedFiatAmount([
              b.lastCycleRewards.rif.amount,
              b.lastCycleRewards.rbtc.amount,
              b.lastCycleRewards.usdrif.amount,
            ]).toNumber()
          : 0
        return Big(aValue).sub(bValue).toNumber()
      },

      rewards_upcoming: (a, b) => {
        const aValue = a.backerEstimatedRewards
          ? getCombinedFiatAmount([
              a.backerEstimatedRewards.rif.amount,
              a.backerEstimatedRewards.rbtc.amount,
              a.backerEstimatedRewards.usdrif.amount,
            ]).toNumber()
          : 0
        const bValue = b.backerEstimatedRewards
          ? getCombinedFiatAmount([
              b.backerEstimatedRewards.rif.amount,
              b.backerEstimatedRewards.rbtc.amount,
              b.backerEstimatedRewards.usdrif.amount,
            ]).toNumber()
          : 0
        return Big(aValue).sub(bValue).toNumber()
      },

      backing: (a, b) => Number((a.totalAllocation ?? 0n) - (b.totalAllocation ?? 0n)),

      backingShare: (a, b) =>
        Number((a.totalAllocationPercentage ?? 0n) - (b.totalAllocationPercentage ?? 0n)),
    }

    const sortFn = columnId && comparators[columnId]

    const sorted = sortFn
      ? [...filtered].sort((a, b) => (direction === 'asc' ? sortFn(a, b) : sortFn(b, a)))
      : filtered

    const totalRewards = filtered.length
    const pagedRewards = sorted.slice(pageOptions.start, pageOptions.end)

    return { pagedRewards, totalRewards } as const
  }, [allBuilders, filterOption, pageOptions, sort])

  return { data, isLoading, error }
}

interface BuilderDataRowProps extends CommonComponentProps<HTMLTableRowElement> {
  row: BuilderTable['Row']
  userBacking: bigint
  logic: BuilderRowLogic
  actionCount: number
}

const BuilderDataRow: FC<BuilderDataRowProps> = ({ ...props }) => {
  const isDesktop = useIsDesktop()
  return isDesktop ? <DesktopBuilderRow {...props} /> : <MobileBuilderRow {...props} />
}

// ---------------- Table ----------------

export const BuildersTable = ({ filterOption }: { filterOption: BuilderFilterOptionId }) => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)

  const { isConnected } = useAccount()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const isDesktop = useIsDesktop()

  const { rows, columns, selectedRows, sort } = useTableContext<ColumnId, BuilderCellDataMap>()
  const [actions, setActions] = useState<Action[]>([])
  const dispatch = useTableActionsContext<ColumnId, BuilderCellDataMap>()

  // Helper function to create simplified builder row logic (only shared state)
  const createBuilderRowLogic = (row: BuilderTable['Row'], userBacking: bigint): BuilderRowLogic => {
    const { id: rowId, data } = row
    const { builder } = data as BuilderCellDataMap

    // Computed values (shared across table)
    const hasSelections = Object.values(selectedRows).some(Boolean)
    const isInProgress = isBuilderInProgress(builder.builder)
    const inactiveState = getBuilderInactiveState(builder.builder)
    const hasInactiveState = inactiveState !== null
    const hasBacking = userBacking > 0n
    const canBack = !isInProgress && (!hasInactiveState || hasBacking)
    const isRowSelected = selectedRows[rowId]

    // Event handlers that require table dispatch
    const handleToggleSelection = () => {
      if (!isConnected || !canBack) {
        return
      }

      dispatch({
        type: 'TOGGLE_ROW_SELECTION',
        payload: rowId,
      })
    }

    return {
      // Row data
      data,

      // Computed values (derived from table context)
      hasSelections,
      isInProgress,
      hasInactiveState,
      hasBacking,
      canBack,
      isRowSelected,

      // Shared event handlers (require table dispatch)
      handleToggleSelection,
    }
  }

  const pageOptions = useMemo(() => ({ start: 0, end: pageEnd }), [pageEnd])
  const {
    data: { pagedRewards: buildersRewardsData, totalRewards },
    isLoading,
    error,
  } = usePagedFilteredBuildersRewards({ filterOption, pageOptions, sort })

  const { prices } = usePricesContext()

  const {
    initialState: { allocations },
    state: { isContextLoading },
  } = useContext(AllocationsContext)

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
    // Set default sorting to backer_rewards (descending)
    dispatch({
      type: 'SET_DEFAULT_SORT',
      payload: { columnId: 'backer_rewards', direction: 'desc' },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(buildersRewardsData, prices, allocations),
    })
  }, [buildersRewardsData, prices, allocations, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isLoading || isContextLoading,
    })
  }, [isLoading, isContextLoading, dispatch])

  useEffect(() => {
    if (!error) return
    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message,
      })
    }
  }, [error, dispatch])

  /**
   * Set the action column header to show if the backing share column is hidden.
   * TODO: see if we can do this better to avoid re-rendering the table.
   */
  useEffect(() => {
    const isBackingShareHidden = columns.find(col => col.id == 'backingShare')?.hidden ?? true
    const isActionsHidden = columns.find(col => col.id == 'actions')?.hidden ?? true
    if (isBackingShareHidden === isActionsHidden) {
      dispatch({
        type: 'SET_COLUMN_VISIBILITY',
        payload: {
          columnId: 'actions',
          hidden: !isBackingShareHidden,
        },
      })
    }
  }, [columns, dispatch])

  useEffect(() => {
    const actions = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([rowId]) => {
        const row = rows.find(row => row.id === rowId)
        const actionCell = row?.data?.actions as ActionCellProps
        return actionCell?.actionType
      })
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

  // Handle mobile action bar with BottomDrawer
  useEffect(() => {
    // Only show mobile action bar on mobile devices
    if (isDesktop) {
      closeDrawer()
      return
    }

    const selectedBuilderIds = Object.keys(selectedRows).filter(id => selectedRows[id])
    const selectedCount = selectedBuilderIds.length

    if (selectedCount > 0 && actions.length > 0) {
      const handleDeselectAll = () => {
        dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
      }

      openDrawer(
        <MobileStickyActionBarContent
          actions={actions}
          selectedCount={selectedCount}
          selectedBuilderIds={selectedBuilderIds}
          onDeselectAll={handleDeselectAll}
          onClose={closeDrawer}
        />,
        true, // closeOnRouteChange
      )
    } else {
      closeDrawer()
    }
  }, [selectedRows, actions, openDrawer, closeDrawer, dispatch, isDesktop])

  return (
    <>
      <div className="w-full min-w-full bg-v3-bg-accent-80 md:overflow-x-auto">
        <table className="w-full min-w-full table-fixed md:min-w-[700px] md:table-auto">
          <thead className="hidden md:table-header-group">
            <BuilderHeaderRow actions={actions} />
          </thead>
          <Suspense fallback={<div>Loading table data...</div>}>
            <tbody>
              {rows.map(row => {
                const userBacking = allocations[row.id as Address] ?? 0n
                const logic = createBuilderRowLogic(row, userBacking)
                return (
                  <BuilderDataRow
                    key={row.id}
                    row={row}
                    userBacking={userBacking}
                    logic={logic}
                    actionCount={actions.length}
                  />
                )
              })}
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
        className="px-4 md:px-0"
      />
    </>
  )
}
