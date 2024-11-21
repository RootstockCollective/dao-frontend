import { CycleContextProvider } from '@/app/collective-rewards/metrics'
import { Token, useGetBuildersRewards } from '@/app/collective-rewards/rewards'
import { BuilderContextProviderWithPrices } from '@/app/collective-rewards/user'
import { getCoinbaseAddress, useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/Collapsible'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TableBody, TableCore, TableHead, TableRow } from '@/components/Table'
import { HeaderTitle, Typography } from '@/components/Typography'
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
} from '@/app/collective-rewards/shared'
import { getAddress } from 'viem'
import { tokenContracts } from '@/lib/contracts'

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
    className: 'w-[18%]',
    // eslint-disable-next-line quotes
    tooltip: "The Builder's share of the total allocations",
    sortKey: RewardsColumnKeyEnum.totalAllocationPercentage,
  },
  // TODO: text-center isn't applied
  { label: 'Actions', className: 'w-[14%]' },
]

type BuildersLeaderBoardTableProps = {
  tokens: { [token: string]: Token }
  currency?: string
}
const BuildersLeaderBoardTable: FC<BuildersLeaderBoardTableProps> = ({ tokens, currency }) => {
  const { data: rewardsData, isLoading, error: rewardsError } = useGetBuildersRewards(tokens, currency)
  useHandleErrors({ error: rewardsError, title: 'Error loading builder rewards' })

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
        const aValue = a.lastCycleReward.RIF.crypto.value + a.lastCycleReward.RBTC.crypto.value
        const bValue = b.lastCycleReward.RIF.crypto.value + b.lastCycleReward.RBTC.crypto.value
        return aValue - bValue
      },
      estimatedRewards: (a: IRewardData, b: IRewardData) => {
        const aValue = a.estimatedReward.RIF.crypto.value + a.estimatedReward.RBTC.crypto.value
        const bValue = b.estimatedReward.RIF.crypto.value + b.estimatedReward.RBTC.crypto.value
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

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!tableDataLength) {
    return <EmptyLeaderboard />
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      <TableCore className="table-fixed">
        <TableHead>
          <TableRow>
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
              lastCycleReward,
              estimatedReward,
              totalAllocationPercentage,
              rewardPercentage,
            }) => (
              <TableRow key={address} className="text-[14px] border-hidden">
                <BuilderNameCell tableHeader={tableHeaders[0]} builderName={builderName} address={address} />
                <BackerRewardsPercentage tableHeader={tableHeaders[1]} percentage={rewardPercentage} />
                <LazyRewardCell
                  tableHeader={tableHeaders[2]}
                  rewards={[lastCycleReward.RBTC, lastCycleReward.RIF]}
                />
                <LazyRewardCell
                  tableHeader={tableHeaders[3]}
                  rewards={[estimatedReward.RBTC, estimatedReward.RIF]}
                />
                <TotalAllocationCell tableHeader={tableHeaders[4]} percentage={totalAllocationPercentage} />
                <ActionCell tableHeader={tableHeaders[5]} />
              </TableRow>
            ),
          )}
        </TableBody>
      </TableCore>
      <div className="flex justify-center">{paginationUi}</div>
    </div>
  )
}

export const BuildersLeaderBoard = () => {
  const onManageAllocations = () => {
    // TODO: fill the allocation context if necessary and change the route
    console.log('Manage allocations')
  }

  // TODO: check where to store this information
  const tokens = {
    rif: {
      address: getAddress(tokenContracts.RIF),
      symbol: 'RIF',
    },
    rbtc: {
      address: getCoinbaseAddress(),
      symbol: 'RBTC',
    },
  }

  return (
    <>
      <Collapsible defaultOpen>
        <CollapsibleTrigger>
          <div className="flex items-center justify-between w-full">
            <HeaderTitle className="">Rewards leaderboard</HeaderTitle>
            <Button variant="primary" onClick={onManageAllocations}>
              Manage Allocations
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CycleContextProvider>
            <BuilderContextProviderWithPrices>
              <div className="pt-6">
                <BuildersLeaderBoardTable tokens={tokens} />
              </div>
            </BuilderContextProviderWithPrices>
          </CycleContextProvider>
        </CollapsibleContent>
      </Collapsible>
    </>
  )
}

const EmptyLeaderboard = () => (
  <div className="relative w-full">
    <img className="w-full h-fll object-cover" alt="no builders yet" src="/images/joining-without-text.png" />
    <Typography
      tagVariant="h1"
      className="uppercase font-kk-topo text-[48px] leading-tight font-normal absolute inset-0 flex items-center justify-center tracking-[-0.96px]"
    >
      Builders are joining soon...
    </Typography>
  </div>
)
