'use client'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useGetBuildersRewards } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import { Builder } from '@/app/collective-rewards/types'
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
import BuilderFilterDropdown, { BuilderFilterOption } from '../../BuilderFilterDropdown'
import { BuilderDataRow, convertDataToRowData } from './BuilderDataRow'
import { BuilderHeaderRow } from './BuilderHeaderRow'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BuilderTable.config'
import { Action } from './Cell/ActionCell'

export const Table = () => {
  const { columns, rows, sort, loading } = useTableContext<ColumnId>()

  const {
    state: { allocations, selections },
  } = useContext(AllocationsContext)

  const dispatch = useTableActionsContext<ColumnId>()

  useEffect(() => {
    dispatch({
      type: 'SET_SELECTED_ROWS',
      payload: selections as SelectedRows<Row<ColumnId>['id']>,
    })
  }, [selections])

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

  const { address: userAddress } = useAccount()

  const { columns, rows, sort } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext<ColumnId>()

  const tokens = useMemo(() => getTokens(), [])
  const { data: buildersRewardsData, isLoading, error } = useGetBuildersRewards(tokens)

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
      enabled: !!userAddress && !!buildersRewardsData,
    },
  )

  const { prices } = usePricesContext()
  const rifPrice = prices[tokens.rif.symbol]?.price ?? 0

  const builderCount = buildersRewardsData?.length || 0

  const handleAction = (action: Action, builder: Builder) => {
    console.log('handleAction', action, builder)
  }

  /**
   * Set the action column header to show if the allocations column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
  //  */
  useEffect(() => {
    const isAllocationsHidden = columns.find(col => col.id == 'backing_share')?.hidden
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
    if (userAddress && columns.find(col => col.id == 'backing')?.hidden) {
      dispatch({
        type: 'TOGGLE_COLUMN_VISIBILITY',
        payload: 'backing',
      })
    }
  }, [userAddress, columns])

  useEffect(() => {
    setPageEnd(prev => prev + PAGE_SIZE)
  }, [])

  useEffect(() => {
    if (allocations?.length) {
      dispatch({
        type: 'SET_ROWS',
        payload: convertDataToRowData(buildersRewardsData, allocations, rifPrice, handleAction),
      })
    }
  }, [buildersRewardsData, allocations])

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isLoading || false,
    })
  }, [isLoading])

  useEffect(() => {
    dispatch({
      type: 'SET_ERROR',
      payload: error ? error.message : null,
    })
  }, [error])

  return (
    <>
      {/* FIXME: add a custom hook to make filtered queries instead of using the useGetBuildersRewards */}
      {/* FIXME: Align the filter with the section title */}
      <BuilderFilterDropdown
        className="top-[-1rem]"
        onSelected={(optionId: BuilderFilterOption) => {
          console.log(
            `selected builder state filter option: ${optionId}. create a custom hook to make filtered queries instead of using the useGetBuildersRewards`,
          )
        }}
      />
      <Table />
      <TablePager
        pageSize={pageEnd}
        totalItems={builderCount}
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
