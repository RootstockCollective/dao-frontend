import { FC, useCallback, useMemo, useState } from 'react'
import { RewardDetails, useBackerRewardsContext, useGetBackerRewards } from '@/app/collective-rewards/rewards'
import {
  ISortConfig,
  TableHeader,
  TableHeaderCell,
  BackerRewardsPercentage,
  BuilderNameCell,
  LazyRewardCell,
} from '@/app/collective-rewards/shared'
import { TableBody, TableCore, TableHead, TableRow } from '@/components/Table'
import { getCombinedFiatAmount, useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useBasicPaginationUi } from '@/shared/hooks/usePaginationUi'
import Big from '@/lib/big'
import { Typography } from '@/components/Typography/Typography'
import { cn } from '@/lib/utils'

enum RewardsColumnKeyEnum {
  builder = 'builder',
  rewardPercentage = 'rewardPercentage',
  estimatedRewards = 'estimatedRewards',
  totalAllocation = 'totalAllocation',
  claimableRewards = 'claimableRewards',
  allTimeRewards = 'allTimeRewards',
}

const defaultTable: Record<RewardsColumnKeyEnum, TableHeader> = {
  [RewardsColumnKeyEnum.builder]: {
    label: 'Builder',
    className: 'w-[16%]',
  },
  [RewardsColumnKeyEnum.rewardPercentage]: {
    label: 'Backer Rewards %',
    className: 'w-[16%]',
  },
  [RewardsColumnKeyEnum.claimableRewards]: {
    label: 'Claimable Rewards',
    tooltip: { text: 'Your rewards from each Builder available to claim' },
  },
  [RewardsColumnKeyEnum.estimatedRewards]: {
    label: 'Estimated Rewards',
    tooltip: {
      text: (
        <>
          <Typography>
            An estimate of the remainder of this Cycle’s rewards from each Builder that will become fully
            claimable by the end of the current Cycle. These rewards gradually transition into your ‘Claimable
            Rewards’ as the cycle progresses.
          </Typography>
          <Typography marginTop="1rem" marginBottom="1rem">
            To check the cycle`s completion, go to Collective Rewards → Current Cycle.
          </Typography>
          <Typography>
            The displayed information is dynamic and may vary based on total rewards and user activity. This
            data is for informational purposes only.
          </Typography>
        </>
      ),
      side: 'bottom',
    },
  },
  [RewardsColumnKeyEnum.allTimeRewards]: {
    label: 'All Time Rewards',
  },
  [RewardsColumnKeyEnum.totalAllocation]: {
    label: 'My Allocation',
    className: 'w-[16%]',
  },
}

const isHidable = (key: RewardsColumnKeyEnum) => key === RewardsColumnKeyEnum.allTimeRewards

type BackerRewardsTable = Omit<RewardDetails, 'gauges'>
export const BackerRewardsTable: FC<BackerRewardsTable> = ({ builder, tokens }) => {
  const { data: rewardsData, isLoading, error: rewardsError } = useGetBackerRewards(builder, tokens)
  const {
    detailedView: { value: isDetailedView },
  } = useBackerRewardsContext()
  useHandleErrors({ error: rewardsError, title: 'Error loading backer rewards' })

  const [sortConfig, setSortConfig] = useState<ISortConfig>({
    key: RewardsColumnKeyEnum.totalAllocation,
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
        const aValue = getCombinedFiatAmount([a.estimatedRewards.rif.amount, a.estimatedRewards.rbtc.amount])
        const bValue = getCombinedFiatAmount([b.estimatedRewards.rif.amount, b.estimatedRewards.rbtc.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      totalAllocation: (a: IRewardData, b: IRewardData) => {
        const aValue = getCombinedFiatAmount([a.totalAllocation.rif.amount])
        const bValue = getCombinedFiatAmount([b.totalAllocation.rif.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      claimableRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = getCombinedFiatAmount([a.claimableRewards.rif.amount, a.claimableRewards.rbtc.amount])
        const bValue = getCombinedFiatAmount([b.claimableRewards.rif.amount, b.claimableRewards.rbtc.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
      allTimeRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = getCombinedFiatAmount([a.allTimeRewards.rif.amount, a.allTimeRewards.rbtc.amount])
        const bValue = getCombinedFiatAmount([b.allTimeRewards.rif.amount, b.allTimeRewards.rbtc.amount])
        return Big(aValue).sub(bValue).toNumber()
      },
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
    },
    [],
  )

  if (isLoading) {
    return <LoadingSpinner />
  }
  return (
    <div className="flex flex-col gap-5 w-full">
      <>
        <TableCore className="table-fixed overflow-visible">
          <TableHead>
            <TableRow className="min-h-0 normal-case">
              {Object.entries(defaultTable).map(([key, { className, label, tooltip }]) => (
                <TableHeaderCell
                  key={key}
                  className={cn(className, {
                    hidden: !isDetailedView && isHidable(key as RewardsColumnKeyEnum),
                  })}
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
                rewardPercentage,
                estimatedRewards,
                totalAllocation,
                claimableRewards,
                allTimeRewards,
              }) => (
                <TableRow key={address} className="text-[14px] border-hidden">
                  <BuilderNameCell builderName={builderName} address={address} stateFlags={stateFlags} />
                  <BackerRewardsPercentage percentage={rewardPercentage} />
                  <LazyRewardCell rewards={[claimableRewards.rbtc, claimableRewards.rif]} />
                  <LazyRewardCell rewards={[estimatedRewards.rbtc, estimatedRewards.rif]} />
                  <LazyRewardCell
                    rewards={[allTimeRewards.rbtc, allTimeRewards.rif]}
                    isHidden={!isDetailedView && isHidable(RewardsColumnKeyEnum.allTimeRewards)}
                  />
                  <LazyRewardCell rewards={[totalAllocation.rif]} />
                </TableRow>
              ),
            )}
          </TableBody>
        </TableCore>
        <div className="flex justify-center">{paginationUi}</div>
      </>
    </div>
  )
}
