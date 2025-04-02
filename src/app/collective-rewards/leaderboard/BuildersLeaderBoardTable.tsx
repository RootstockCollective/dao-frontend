import { BuildersRewards } from '@/app/collective-rewards/rewards'
import { TableBody, TableCore, TableHead, TableRow } from '@/components/Table'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import { FC, useCallback, useMemo, useState } from 'react'
import {
  ISortConfig,
  TableHeader,
  TableHeaderCell,
  ActionCell,
  BackerRewardsPercentage,
  BuilderNameCell,
  LazyRewardCell,
  TotalAllocationCell,
  useSearchContext,
} from '@/app/collective-rewards/shared'
import { getCombinedFiatAmount } from '../utils'
import Big from '@/lib/big'

enum RewardsColumnKeyEnum {
  builder = 'builder',
  rewardPercentage = 'rewardPercentage',
  lastCycleRewards = 'lastCycleRewards',
  estimatedRewards = 'estimatedRewards',
  totalAllocationPercentage = 'totalAllocationPercentage',
  actions = 'actions',
}

const defaultTable: Record<RewardsColumnKeyEnum, TableHeader> = {
  [RewardsColumnKeyEnum.builder]: {
    label: 'Builder',
    className: 'w-[14%]',
  },
  [RewardsColumnKeyEnum.rewardPercentage]: {
    label: 'Backer Rewards %',
    className: 'w-[10%]',
  },
  [RewardsColumnKeyEnum.lastCycleRewards]: {
    label: 'Last Cycle Rewards',
    tooltip: { text: 'The Backers’ share of the Builder’s rewards in the previous Cycle' },
    className: 'w-[22%]',
  },
  [RewardsColumnKeyEnum.estimatedRewards]: {
    label: 'Est. Backers Rewards',
    tooltip: {
      text: (
        <>
          The estimated Backers’ share of the Builder’s rewards which will become claimable in the next Cycle.
          <br />
          <br />
          The displayed information is dynamic and may vary based on total rewards and user activity. This
          data is for informational purposes only.
        </>
      ),
      popoverProps: { size: 'medium' },
    },
    className: 'w-[22%]',
  },
  [RewardsColumnKeyEnum.totalAllocationPercentage]: {
    label: 'Total Allocations',
    className: 'w-[16%]',
    tooltip: { text: 'The Builder’s share of the total stRIF allocations' },
  },
  [RewardsColumnKeyEnum.actions]: {
    label: 'Actions',
    className: 'w-[14%]',
  },
}

export const BuildersLeaderBoardTable: FC = () => {
  const { data: rewardsData } = useSearchContext<BuildersRewards>()

  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: RewardsColumnKeyEnum.totalAllocationPercentage,
    direction: 'desc',
  })

  // pagination
  const buildersPerPage = 10
  const tableDataLength = useMemo(() => Object.keys(rewardsData).length, [rewardsData])
  const maxPages = useMemo(() => Math.ceil(tableDataLength / buildersPerPage), [tableDataLength])
  const { paginationUi, currentPage } = useBasicPaginationUi(maxPages)

  const sortedRewardsData = useMemo(() => {
    type IRewardData = (typeof rewardsData)[number]
    const sortingFunctionByKey: Record<string, (a: IRewardData, b: IRewardData) => number> = {
      builder: (a: IRewardData, b: IRewardData) =>
        (a.builderName || a.address).localeCompare(b.builderName || b.address),
      rewardPercentage: (a: IRewardData, b: IRewardData) =>
        Number(a.rewardPercentage.current - b.rewardPercentage.current),
      lastCycleRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = getCombinedFiatAmount([a.lastCycleRewards.rif.amount, a.lastCycleRewards.rbtc.amount])
        const bValue = getCombinedFiatAmount([b.lastCycleRewards.rif.amount, b.lastCycleRewards.rbtc.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      estimatedRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = getCombinedFiatAmount([a.estimatedRewards.rif.amount, a.estimatedRewards.rbtc.amount])
        const bValue = getCombinedFiatAmount([b.estimatedRewards.rif.amount, b.estimatedRewards.rbtc.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      totalAllocationPercentage: (a: IRewardData, b: IRewardData) =>
        Number(a.totalAllocationPercentage - b.totalAllocationPercentage),
    }

    return Object.values(rewardsData).toSorted((a: IRewardData, b: IRewardData) => {
      const { key, direction } = sortConfig
      if (!key) return 0

      return direction === 'asc' ? sortingFunctionByKey[key](a, b) : sortingFunctionByKey[key](b, a)
    })
  }, [rewardsData, sortConfig])

  const paginatedRewardsData = useMemo(
    () => sortedRewardsData.slice(currentPage * buildersPerPage, (currentPage + 1) * buildersPerPage),
    [currentPage, sortedRewardsData],
  )

  const handleSort = useCallback(
    (key?: string) => () => {
      if (!key || key === 'actions') {
        return
      }
      setSortConfig(prevSortConfig => {
        if (prevSortConfig?.key === key) {
          // Toggle direction if the same column is clicked
          return {
            key,
            direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
          }
        }
        // Set initial sort direction to ascending
        return { key, direction: 'asc' }
      })
    },
    [],
  )

  return (
    <div className="flex flex-col gap-5 w-full">
      <TableCore className="table-fixed overflow-visible">
        <TableHead>
          <TableRow className="normal-case">
            {Object.entries(defaultTable).map(([key, { className, label, tooltip }]) => (
              <TableHeaderCell
                key={key}
                className={className}
                label={label}
                tooltip={tooltip}
                sortKey={key}
                onSort={handleSort(key)}
                sortConfig={sortConfig}
              />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRewardsData.map(
            ({
              address,
              builderName,
              stateFlags,
              lastCycleRewards,
              estimatedRewards,
              totalAllocationPercentage,
              rewardPercentage,
            }) => (
              <TableRow key={address} className="text-[14px] border-hidden">
                <BuilderNameCell builderName={builderName} address={address} stateFlags={stateFlags} />
                <BackerRewardsPercentage percentage={rewardPercentage} />
                <LazyRewardCell rewards={[lastCycleRewards.rbtc, lastCycleRewards.rif]} />
                <LazyRewardCell rewards={[estimatedRewards.rbtc, estimatedRewards.rif]} />
                <TotalAllocationCell percentage={totalAllocationPercentage} />
                <ActionCell builderAddress={address} />
              </TableRow>
            ),
          )}
        </TableBody>
      </TableCore>
      <div className="flex justify-center">{paginationUi}</div>
    </div>
  )
}
