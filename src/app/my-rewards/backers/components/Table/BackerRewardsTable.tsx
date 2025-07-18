import { Suspense, useEffect, useMemo, useState } from 'react'
import { BackerRewardsHeaderRow } from './BackerRewardsHeaderRow'
import { usePricesContext, useTableActionsContext, useTableContext } from '@/shared/context'
import { ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BackerRewardsTable.config'
import { convertDataToRowData, BackerRewardsDataRow } from './BackerRewardsDataRow'
import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Builder } from '@/app/collective-rewards/types'
import { BackerRewards, useGetBackerRewards } from '@/app/collective-rewards/rewards/backers/hooks'
import { getTokens } from '@/lib/tokens'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { Token } from '@/app/collective-rewards/rewards'
import TablePager from '@/components/TableNew/TablePager'

type PagedFilter = {
  backer: Address
  tokens: { [token: string]: Token }
  pageOptions: { start: number; end: number }
}
const usePagedFilteredBackerRewards = ({
  backer,
  tokens,
  pageOptions,
}: PagedFilter): {
  data: { pagedRewards: BackerRewards[]; totalRewards: number }
  isLoading: boolean
  error: Error | null
} => {
  const { data: backerRewards, isLoading, error } = useGetBackerRewards(backer, tokens)
  const data = useMemo(() => {
    const totalRewards = backerRewards?.length ?? 0
    const pagedRewards = backerRewards?.slice(pageOptions.start, pageOptions.end)

    return { pagedRewards, totalRewards } as const
  }, [backerRewards, pageOptions])

  return { data, isLoading, error }
}

// --- Table component ---
export const Table = () => {
  const { rows, columns } = useTableContext<ColumnId>()

  const dispatch = useTableActionsContext<ColumnId>()

  /**
   * Set the action column header to show if the allocations column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
  //  */
  useEffect(() => {
    const isAllocationsHidden = columns.find(col => col.id == 'backing')?.hidden ?? true
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
          <BackerRewardsHeaderRow />
        </thead>
        <Suspense fallback={<div>Loading table data...</div>}>
          <tbody>
            {rows.map(row => (
              <BackerRewardsDataRow key={row.id} row={row} />
            ))}
          </tbody>
        </Suspense>
      </table>
    </div>
  )
}

export const BackerRewardsTable = () => {
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)

  const { address: userAddress } = useAccount()

  const dispatch = useTableActionsContext<ColumnId>()

  const tokens = useMemo(() => getTokens(), [])

  const {
    data: { pagedRewards: backerRewards, totalRewards },
    isLoading,
    error,
  } = usePagedFilteredBackerRewards({
    backer: userAddress as Address,
    tokens,
    pageOptions: { start: 0, end: pageEnd },
  })

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
  }, [userAddress, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })
    /*  setPageEnd(prev => prev + PAGE_SIZE) */
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(backerRewards, prices, handleAction),
    })
  }, [backerRewards, prices, dispatch])

  useEffect(() => {
    dispatch({
      type: 'SET_LOADING',
      payload: isLoading || false,
    })
  }, [isLoading, dispatch])

  useEffect(() => {
    if (!error) return
    if (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.message,
      })
    }
  }, [error, dispatch])

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
