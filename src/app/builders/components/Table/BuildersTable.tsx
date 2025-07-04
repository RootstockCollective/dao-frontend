'use client'

import { useGetBuildersRewards } from '@/app/collective-rewards/rewards' // FIXME: change path so as to not import from a cousin folder
import TablePager from '@/components/TableNew/TablePager'
import { getTokens } from '@/lib/tokens'
import { useTableActionsContext, useTableContext, withTableContext } from '@/shared/context'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { TableColumnDropdown } from '../TableColumnDropdown'
import { BuilderDataRow, convertDataToRowData } from './BuilderDataRow'
import { BuilderHeaderRow, ColumnId, DEFAULT_HEADERS } from './BuilderHeaderRow'

const PAGE_SIZE = 3

// ---------------- Table ----------------
const BuildersTable = () => {
  const [pageEnd, setPageEnd] = useState(10)

  const { columns, rows, sort } = useTableContext<ColumnId>()
  const dispatch = useTableActionsContext<ColumnId>()
  const tokens = useMemo(() => getTokens(), [])
  const { data: buildersRewardsData, isLoading, error } = useGetBuildersRewards(tokens)

  const builderCount = buildersRewardsData?.length || 0

  /**
   * Set the action column header to show if the allocations column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
  //  */
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
    setPageEnd(prev => prev + PAGE_SIZE)
  }, [])

  useEffect(() => {
    if (buildersRewardsData?.length) {
      dispatch({
        type: 'SET_ROWS',
        payload: convertDataToRowData(buildersRewardsData),
      })
    }
  }, [buildersRewardsData])

  return (
    <>
      <TableColumnDropdown className="self-end" />
      {/* <BuilderFilterDropdown onSelected={() => {}} /> FIXME: add onSelected */}
      <div className="w-full">
        <table className="w-full table-fixed">
          <thead>
            <BuilderHeaderRow />
          </thead>
          <tbody>
            <Suspense fallback={<div>Loading table rows...</div>}>
              {isLoading && <div>Loading table rows...</div>}
              {rows.map(row => (
                <BuilderDataRow key={row.id} row={row} columns={columns} />
              ))}
            </Suspense>
          </tbody>
        </table>
      </div>
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
