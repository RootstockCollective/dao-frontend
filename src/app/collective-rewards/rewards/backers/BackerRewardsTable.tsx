import { FC, useMemo, useState } from 'react'
import {
  RewardDetails,
  BackerRewardsContextProvider,
  useGetBackerRewards,
} from '@/app/collective-rewards/rewards'
import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/user'
import {
  ISortConfig,
  TableHeader,
  TableHeaderCell,
  BackerRewardsPercentage,
  BuilderNameCell,
  LazyRewardCell,
  TotalAllocationCell,
} from '@/app/collective-rewards/shared'
import { TableBody, TableCore, TableHead, TableRow } from '@/components/Table'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import Link from 'next/link'

enum RewardsColumnKeyEnum {
  builder = 'builder',
  rewardPercentage = 'rewardPercentage',
  estimatedRewards = 'estimatedRewards',
  totalAllocationPercentage = 'totalAllocationPercentage',
  claimableRewards = 'claimableRewards',
  allTimeRewards = 'allTimeRewards',
}

const tableHeaders: TableHeader[] = [
  { label: 'Builder', className: 'w-[11%]', sortKey: RewardsColumnKeyEnum.builder },
  { label: 'Backer Rewards %', className: 'w-[11%]', sortKey: RewardsColumnKeyEnum.rewardPercentage },
  {
    label: 'Estimated Rewards',
    className: 'w-[20%]',
    sortKey: RewardsColumnKeyEnum.estimatedRewards,
    tooltip: {
      text: `An estimate of this Cycle’s rewards from each Builder that will become fully claimable by the end of the current Cycle. These rewards gradually become claimable and are added to your ‘Claimable Rewards’ as the cycle progresses. To check the cycle completion, go to Collective Rewards → Current Cycle. 

        The displayed information is dynamic and may vary based on total rewards and user activity. This data is for informational purposes only.`,
      popoverProps: { size: 'medium' },
    },
  },
  {
    label: 'Total Allocations',
    className: 'w-[18%]',
    sortKey: RewardsColumnKeyEnum.totalAllocationPercentage,
    tooltip: { text: 'Your share of the total allocations for each Builder' },
  },
  {
    label: 'Claimable Rewards',
    className: 'w-[20%]',
    sortKey: RewardsColumnKeyEnum.claimableRewards,
    tooltip: { text: 'Your rewards from each Builder available to claim' },
  },
  { label: 'All Time Rewards', className: 'w-[20%]', sortKey: RewardsColumnKeyEnum.allTimeRewards },
]

const RewardsTable: FC<BackerRewardsTable> = ({ builder, gauges, tokens }) => {
  const { data: rewardsData, isLoading, error: rewardsError } = useGetBackerRewards(builder, gauges, tokens)
  useHandleErrors({ error: rewardsError, title: 'Error loading backer rewards' })

  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: RewardsColumnKeyEnum.totalAllocationPercentage,
    direction: 'asc',
  })

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
      estimatedRewards: (a: IRewardData, b: IRewardData) => {
        return Number(a.estimatedRewards.rif.crypto.value - b.estimatedRewards.rif.crypto.value)
      },
      totalAllocationPercentage: (a: IRewardData, b: IRewardData) =>
        Number(a.totalAllocationPercentage - b.totalAllocationPercentage),
      claimableRewards: (a: IRewardData, b: IRewardData) =>
        Number(a.claimableRewards.rif.crypto.value - b.claimableRewards.rif.crypto.value),
      allTimeRewards: (a: IRewardData, b: IRewardData) =>
        Number(a.allTimeRewards.rif.crypto.value - b.allTimeRewards.rif.crypto.value),
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {Object.values(paginatedRewardsData).length === 0 ? (
        <div className="text-center font-kk-topo">
          Have your say! Start voting now to shape the RootstockCollective community. Click{' '}
          <Link href={'/collective-rewards'} className="text-[#E56B1A]">
            here
          </Link>{' '}
          to begin!
        </div>
      ) : (
        <>
          <TableCore className="table-fixed">
            <TableHead>
              <TableRow className="min-h-0 normal-case">
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
                  rewardPercentage,
                  estimatedRewards,
                  totalAllocationPercentage,
                  claimableRewards,
                  allTimeRewards,
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
                      rewards={[estimatedRewards.rbtc, estimatedRewards.rif]}
                    />
                    <TotalAllocationCell
                      tableHeader={tableHeaders[3]}
                      percentage={totalAllocationPercentage}
                    />
                    <LazyRewardCell
                      tableHeader={tableHeaders[4]}
                      rewards={[claimableRewards.rbtc, claimableRewards.rif]}
                    />
                    <LazyRewardCell
                      tableHeader={tableHeaders[5]}
                      rewards={[allTimeRewards.rbtc, allTimeRewards.rif]}
                    />
                  </TableRow>
                ),
              )}
            </TableBody>
          </TableCore>
          <div className="flex justify-center">{paginationUi}</div>
        </>
      )}
    </div>
  )
}

type BackerRewardsTable = Omit<RewardDetails, 'gauge'>
export const BackerRewardsTable: FC<BackerRewardsTable> = ({ builder, tokens, gauges }) => {
  return (
    <>
      <BackerRewardsContextProvider backer={builder} gauges={gauges} tokens={tokens}>
        <CycleContextProvider>
          <RewardsTable builder={builder} tokens={tokens} gauges={gauges} />
        </CycleContextProvider>
      </BackerRewardsContextProvider>
    </>
  )
}
