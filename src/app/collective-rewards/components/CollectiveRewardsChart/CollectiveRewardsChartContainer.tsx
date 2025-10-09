import { CollectiveRewardsDualAxisChart } from './CollectiveRewardsChart'
import { useGetChartBackingData } from '@/app/collective-rewards/rewards/hooks/useGetChartBackingData'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { transformApiDataToChartData } from '@/app/collective-rewards/utils/chartUtils'
import { DailyAllocationItem, CycleRewardsItem } from '@/app/collective-rewards/types'
import { useGetChartRewardsData } from '../../rewards/hooks/useGetChartRewardsData'
import { usePricesContext } from '@/shared/context/PricesContext'
import { TOKENS } from '@/lib/tokens'
import { useMemo } from 'react'

/**
 * Container component for the collective rewards chart
 * Handles data fetching, loading states, and error handling
 */
export const CollectiveRewardsChartContainer = () => {
  const { data: backingData, isLoading: isBackingLoading, error: backingError } = useGetChartBackingData()
  const { data: rewardsData, isLoading: isRewardsLoading, error: rewardsError } = useGetChartRewardsData()
  const { prices } = usePricesContext()

  const { rif, rbtc } = TOKENS

  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0

  useHandleErrors({
    error: backingError || rewardsError,
    title: 'Error loading collective rewards chart data',
  })

  if (backingError || rewardsError || !backingData || !rewardsData) {
    return null
  }

  return (
    <CollectiveRewardsChartContentWithSpinner
      isLoading={isBackingLoading || isRewardsLoading}
      backingData={backingData || []}
      rewardsData={rewardsData || []}
      rifPrice={rifPrice}
      rbtcPrice={rbtcPrice}
    />
  )
}

interface CollectiveRewardsChartContentProps {
  backingData: DailyAllocationItem[]
  rewardsData: CycleRewardsItem[]
  rifPrice: number
  rbtcPrice: number
}

const CollectiveRewardsChartContent = ({
  backingData,
  rewardsData,
  rifPrice,
  rbtcPrice,
}: CollectiveRewardsChartContentProps) => {
  const { backingSeries, rewardsSeries, cycles } = useMemo(
    () => transformApiDataToChartData(backingData, rewardsData, rifPrice, rbtcPrice),
    [backingData, rewardsData, rifPrice, rbtcPrice],
  )

  return (
    <CollectiveRewardsDualAxisChart
      backingSeries={backingSeries}
      rewardsSeries={rewardsSeries}
      cycles={cycles}
    />
  )
}

const CollectiveRewardsChartContentWithSpinner = withSpinner(CollectiveRewardsChartContent)
