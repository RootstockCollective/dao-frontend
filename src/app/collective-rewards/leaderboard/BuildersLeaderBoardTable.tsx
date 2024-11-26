import { BuildersRewards } from '@/app/collective-rewards/rewards'
import { TableBody, TableCore, TableHead, TableRow } from '@/components/Table'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import { FC, useMemo, useState } from 'react'
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

enum RewardsColumnKeyEnum {
  builder = 'builder',
  rewardPercentage = 'rewardPercentage',
  lastCycleRewards = 'lastCycleRewards',
  estimatedRewards = 'estimatedRewards',
  totalAllocationPercentage = 'totalAllocationPercentage',
  actions = 'actions',
}

const tableHeaders: TableHeader[] = [
  { label: 'Builder', className: 'w-[14%]', sortKey: RewardsColumnKeyEnum.builder },
  { label: 'Backer Rewards %', className: 'w-[10%]', sortKey: RewardsColumnKeyEnum.rewardPercentage },
  { label: 'Last Cycle Rewards', className: 'w-[22%]', sortKey: RewardsColumnKeyEnum.lastCycleRewards },
  { label: 'Est. Backers Rewards', className: 'w-[22%]', sortKey: RewardsColumnKeyEnum.estimatedRewards },
  {
    label: 'Total Allocations',
    className: 'w-[16%]',
    tooltip: 'The Builder’s share of the total stRIF allocations',
    sortKey: RewardsColumnKeyEnum.totalAllocationPercentage,
  },
  // TODO: text-center isn't applied
  { label: 'Actions', className: 'w-[14%]' },
]

export const BuildersLeaderBoardTable: FC = () => {
  const { data: rewardsData } = useSearchContext<BuildersRewards>()

  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: RewardsColumnKeyEnum.totalAllocationPercentage,
    direction: 'asc',
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
        const aValue = a.lastCycleReward.rif.crypto.value + a.lastCycleReward.rbtc.crypto.value
        const bValue = b.lastCycleReward.rif.crypto.value + b.lastCycleReward.rbtc.crypto.value
        return aValue - bValue
      },
      estimatedRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = a.estimatedReward.rif.crypto.value + a.estimatedReward.rbtc.crypto.value
        const bValue = b.estimatedReward.rif.crypto.value + b.estimatedReward.rbtc.crypto.value
        return aValue - bValue
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

  const handleSort = (key?: string) => {
    if (!key) {
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
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <TableCore className="table-fixed">
        <TableHead>
          <TableRow className="normal-case">
            {tableHeaders.map(header => (
              <TableHeaderCell
                key={header.label}
                tableHeader={header}
                onSort={() => handleSort(header.sortKey)}
                sortConfig={sortConfig}
              />
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(paginatedRewardsData).map(
            ({
              address,
              builderName,
              stateFlags,
              lastCycleReward,
              estimatedReward,
              totalAllocationPercentage,
              rewardPercentage,
            }) => (
              <TableRow key={address} className="text-[14px] border-hidden">
                <BuilderNameCell
                  tableHeader={tableHeaders[0]}
                  builderName={builderName}
                  address={address}
                  stateFlags={stateFlags}
                />
                <BackerRewardsPercentage tableHeader={tableHeaders[1]} percentage={rewardPercentage} />
                <LazyRewardCell
                  tableHeader={tableHeaders[2]}
                  rewards={[lastCycleReward.rbtc, lastCycleReward.rif]}
                />
                <LazyRewardCell
                  tableHeader={tableHeaders[3]}
                  rewards={[estimatedReward.rbtc, estimatedReward.rif]}
                />
                <TotalAllocationCell tableHeader={tableHeaders[4]} percentage={totalAllocationPercentage} />
                <ActionCell tableHeader={tableHeaders[5]} builderAddress={address} />
              </TableRow>
            ),
          )}
        </TableBody>
      </TableCore>
      <div className="flex justify-center">{paginationUi}</div>
    </div>
  )
}
