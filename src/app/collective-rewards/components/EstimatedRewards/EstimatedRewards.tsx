import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { parseEther } from 'viem'
import { formatSymbol } from '../../rewards/utils'
import { useGetCycleRewards } from '../../shared/hooks/useGetCycleRewards'
import { useHandleErrors } from '../../utils'

export const EstimatedRewards = () => {
  let { data: cycleRewards, isLoading: cycleRewardsLoading, error: cycleRewardsError } = useGetCycleRewards()

  const { prices } = usePricesContext()

  useHandleErrors({ error: cycleRewardsError, title: 'Error loading cycle rewards' })
  const rifPrice = prices.RIF?.price ?? 0
  const rbtcPrice = prices.RBTC?.price ?? 0

  const rifPriceInWei = parseEther(rifPrice.toString())
  const rbtcPriceInWei = parseEther(rbtcPrice.toString())

  const rifAmount = cycleRewards?.rifRewards ?? 0n
  const rbtcAmount = cycleRewards?.rbtcRewards ?? 0n
  const rifAmountInFiat = (rifAmount * rifPriceInWei) / WeiPerEther
  const rbtcAmountInFiat = (rbtcAmount * rbtcPriceInWei) / WeiPerEther
  return (
    <Metric title="Estimated rewards">
      {/* TODO: review this part */}
      {cycleRewardsLoading && <LoadingSpinner />}
      {!cycleRewardsLoading && (
        <div className="flex flex-col gap-2">
          <TokenAmountDisplay
            amount={formatSymbol(rifAmount, 'RIF')}
            tokenSymbol={'RIF'}
            amountInCurrency={formatSymbol(rifAmountInFiat, 'USD')}
          />
          <TokenAmountDisplay
            amount={formatSymbol(rbtcAmount, 'RBTC')}
            tokenSymbol={'RBTC'}
            amountInCurrency={formatSymbol(rbtcAmountInFiat, 'USD')}
          />
        </div>
      )}
    </Metric>
  )
}
