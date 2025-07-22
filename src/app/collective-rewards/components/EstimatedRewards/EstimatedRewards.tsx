import { formatMetrics } from '@/app/collective-rewards/rewards/utils'
import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenAmount } from '@/components/TokenAmount'
import { TokenSymbol } from '@/components/TokenImage'
import { USD } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'

export const EstimatedRewards = () => {
  let { data: cycleRewards, isLoading: cycleRewardsLoading, error: cycleRewardsError } = useGetCycleRewards()

  const { prices } = usePricesContext()

  useHandleErrors({ error: cycleRewardsError, title: 'Error loading cycle rewards' })
  const rifPrice = prices.RIF?.price ?? 0
  const rbtcPrice = prices.RBTC?.price ?? 0

  const rifData = formatMetrics(cycleRewards?.rif ?? 0n, rifPrice, TokenSymbol.RIF, USD)
  const rbtcData = formatMetrics(cycleRewards?.rbtc ?? 0n, rbtcPrice, TokenSymbol.RBTC, USD)

  return (
    // FIXME: reuse this component
    <Metric title="Estimated Rewards" className="w-auto" containerClassName="gap-4">
      {cycleRewardsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-4">
          <TokenAmount
            amount={rifData.amount}
            tokenSymbol={TokenSymbol.RIF}
            amountInFiat={rifData.fiatAmount}
          />
          <TokenAmount
            amount={rbtcData.amount}
            tokenSymbol={TokenSymbol.RBTC}
            amountInFiat={rbtcData.fiatAmount}
          />
        </div>
      )}
    </Metric>
  )
}
