'use client'

import { Action } from '@/app/builders/components/Table/Cell/ActionCell'
import { Token } from '@/app/collective-rewards/rewards'
import { BackerRewards, useGetBackerRewards } from '@/app/collective-rewards/rewards/backers/hooks'
import { getCombinedFiatAmount } from '@/app/collective-rewards/utils'
import { TablePager } from '@/components/TableNew'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext, useTableActionsContext, useTableContext } from '@/shared/context'
import { Row, Sort } from '@/shared/context/TableContext/types'
import { SORT_DIRECTION_ASC } from '@/shared/context/TableContext/constants'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { Big } from 'big.js'
import { useEffect, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { convertDataToRowData } from './BackerRewardsDataRow'
import { BackerRewardsCellDataMap, ColumnId, DEFAULT_HEADERS, PAGE_SIZE } from './BackerRewardsTable.config'
import { DesktopRewardsDetails } from './DesktopRewardsDetails'
import { MobileRewardsDetails } from './MobileRewardsDetails'

const RewardsDetails = ({
  rows,
  actions,
}: {
  rows: Row<ColumnId, Row['id'], BackerRewardsCellDataMap>[]
  actions: Action[]
}) => {
  const isDesktop = useIsDesktop()
  return isDesktop ? (
    <DesktopRewardsDetails rows={rows} actions={actions} />
  ) : (
    <MobileRewardsDetails rows={rows} />
  )
}

interface PagedFilter {
  backer: Address
  tokens: { [token: string]: Token }
  pageOptions: { start: number; end: number }
  sort: Sort<ColumnId>
}
const usePagedFilteredBackerRewards = ({
  backer,
  tokens,
  pageOptions,
  sort,
}: PagedFilter): {
  data: { pagedRewards: BackerRewards[]; totalRewards: number }
  isLoading: boolean
  error: Error | null
} => {
  const { data: backerRewards, isLoading, error } = useGetBackerRewards(backer, tokens)
  const data = useMemo(() => {
    const { columnId, direction } = sort

    const comparators: Partial<Record<ColumnId, (a: BackerRewards, b: BackerRewards) => number>> = {
      builder: ({ builderName: a }, { builderName: b }) =>
        a.trim().toLowerCase().localeCompare(b.trim().toLowerCase()),

      backer_rewards: (a, b) => Number(a.backerRewardPct.current - b.backerRewardPct.current),

      backing: (a, b) => {
        const aValue = getCombinedFiatAmount([a.totalAllocation.rif.amount])
        const bValue = getCombinedFiatAmount([b.totalAllocation.rif.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      estimated: (a, b) => {
        const aValue = getCombinedFiatAmount([
          a.estimatedRewards.rif.amount,
          a.estimatedRewards.rbtc.amount,
          a.estimatedRewards.usdrif.amount,
        ])
        const bValue = getCombinedFiatAmount([
          b.estimatedRewards.rif.amount,
          b.estimatedRewards.rbtc.amount,
          b.estimatedRewards.usdrif.amount,
        ])
        return Big(aValue).sub(bValue).toNumber()
      },
      unclaimed: (a, b) => {
        const aValue = getCombinedFiatAmount([
          a.claimableRewards.rif.amount,
          a.claimableRewards.rbtc.amount,
          a.claimableRewards.usdrif.amount,
        ])
        const bValue = getCombinedFiatAmount([
          b.claimableRewards.rif.amount,
          b.claimableRewards.rbtc.amount,
          b.claimableRewards.usdrif.amount,
        ])
        return Big(aValue).sub(bValue).toNumber()
      },
      total: (a, b) => {
        const aValue = getCombinedFiatAmount([
          a.allTimeRewards.rif.amount,
          a.allTimeRewards.rbtc.amount,
          a.allTimeRewards.usdrif.amount,
        ])
        const bValue = getCombinedFiatAmount([
          b.allTimeRewards.rif.amount,
          b.allTimeRewards.rbtc.amount,
          b.allTimeRewards.usdrif.amount,
        ])
        return Big(aValue).sub(bValue).toNumber()
      },
    }

    const sortFn = columnId && comparators[columnId]

    const sorted = sortFn
      ? [...backerRewards].sort((a, b) => (direction === 'asc' ? sortFn(a, b) : sortFn(b, a)))
      : backerRewards

    const totalRewards = backerRewards.length
    const pagedRewards = sorted.slice(pageOptions.start, pageOptions.end)

    return { pagedRewards, totalRewards } as const
  }, [backerRewards, pageOptions, sort])

  return { data, isLoading, error }
}

export const BackerRewardsTable = () => {
  const isDesktop = useIsDesktop()
  const [pageEnd, setPageEnd] = useState(PAGE_SIZE)

  const { address: userAddress } = useAccount()

  const { rows, columns, selectedRows, sort } = useTableContext<ColumnId, BackerRewardsCellDataMap>()
  const [actions, setActions] = useState<Action[]>([])
  const dispatch = useTableActionsContext<ColumnId, BackerRewardsCellDataMap>()

  const pageOptions = useMemo(() => ({ start: 0, end: pageEnd }), [pageEnd])
  const {
    data: { pagedRewards: backerRewards, totalRewards },
    isLoading,
    error,
  } = usePagedFilteredBackerRewards({
    backer: userAddress!,
    tokens: TOKENS,
    pageOptions,
    sort,
  })

  const { prices } = usePricesContext()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: DEFAULT_HEADERS,
    })

    // Set default sort to unclaimed ascending
    dispatch({
      type: 'SET_DEFAULT_SORT',
      payload: { columnId: 'unclaimed', direction: SORT_DIRECTION_ASC },
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({
      type: 'SET_ROWS',
      payload: convertDataToRowData(backerRewards, prices),
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

  useEffect(() => {
    const actions = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([rowId]) => rows.find(({ id }) => id === rowId)?.data.actions?.actionType)
      .filter(action => action !== undefined)
    setActions(actions)
  }, [selectedRows, rows])

  useEffect(() => {
    dispatch({
      type: 'SET_SELECTED_ROWS',
      payload: {},
    })
  }, [dispatch])

  /**
   * Set the action column header to show if the backing column is hidden.
   * FIXME: see if we can do this better to avoid re-rendering the table.
  //  */
  useEffect(() => {
    const isBackingHidden = columns.find(({ id }) => id == 'backing')?.hidden ?? true
    const isActionsHidden = columns.find(({ id }) => id == 'actions')?.hidden ?? true
    if (isBackingHidden === isActionsHidden) {
      dispatch({
        type: 'SET_COLUMN_VISIBILITY',
        payload: {
          columnId: 'actions',
          hidden: !isBackingHidden,
        },
      })
    }
  }, [columns, dispatch])

  return (
    <>
      <RewardsDetails rows={rows} actions={actions} />
      <TablePager
        pageSize={PAGE_SIZE}
        totalItems={totalRewards}
        onPageChange={({ end }) => {
          setPageEnd(end)
        }}
        pagedItemName={isDesktop ? 'Builders' : ''}
        mode="expandable"
      />
    </>
  )
}
