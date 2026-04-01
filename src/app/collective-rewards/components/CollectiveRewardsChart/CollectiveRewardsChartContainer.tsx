import { useGetChartBackingData } from '@/app/collective-rewards/rewards/hooks/useGetChartBackingData'
import { CycleRewardsItem, DailyAllocationItem } from '@/app/collective-rewards/types'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { transformApiDataToChartData } from '@/app/collective-rewards/utils/chartUtils'
import { FOUR_MONTHS_IN_MS, FIVE_MONTHS_IN_MS } from '@/app/collective-rewards/constants/chartConstants'
import { withSpinner } from '@/components/LoadingSpinner/withLoadingSpinner'
import { TOKENS } from '@/lib/tokens'
import { usePricesContext } from '@/shared/context/PricesContext'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useMemo } from 'react'
import { useGetChartRewardsData } from '../../rewards/hooks/useGetChartRewardsData'
import { CollectiveRewardsDualAxisChart } from './CollectiveRewardsChart'

/**
 * Container component for the collective rewards chart
 * Handles data fetching, loading states, and error handling
 */
export const CollectiveRewardsChartContainer = () => {
  const { data: backingData, isLoading: isBackingLoading, error: backingError } = useGetChartBackingData()
  const { data: rewardsData, isLoading: isRewardsLoading, error: rewardsError } = useGetChartRewardsData()
  const { prices } = usePricesContext()

  const { rif, rbtc, usdrif } = TOKENS
  const rifPrice = prices[rif.symbol]?.price ?? 0
  const rbtcPrice = prices[rbtc.symbol]?.price ?? 0
  const usdrifPrice = prices[usdrif.symbol]?.price ?? 0

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
      usdrifPrice={usdrifPrice}
    />
  )
}

interface CollectiveRewardsChartContentProps {
  backingData: DailyAllocationItem[]
  rewardsData: CycleRewardsItem[]
  rifPrice: number
  rbtcPrice: number
  usdrifPrice: number
}

const CollectiveRewardsChartContent = ({
  backingData,
  rewardsData,
  rifPrice,
  rbtcPrice,
  usdrifPrice,
}: CollectiveRewardsChartContentProps) => {
  const isDesktop = useIsDesktop()
  const windowInMs = isDesktop ? FIVE_MONTHS_IN_MS : FOUR_MONTHS_IN_MS

  const { backingSeries, rewardsSeries, cycles } = useMemo(
    () => transformApiDataToChartData(backingData, rewardsData, rifPrice, rbtcPrice, usdrifPrice, windowInMs),
    [backingData, rewardsData, rifPrice, rbtcPrice, usdrifPrice, windowInMs],
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
