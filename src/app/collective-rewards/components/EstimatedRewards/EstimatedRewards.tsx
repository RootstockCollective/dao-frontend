import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric } from '@/components/Metric'
import { TokenImage, TokenSymbol } from '@/components/TokenImage'
import { Span } from '@/components/TypographyNew'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { parseEther } from 'viem'
import { formatSymbol } from '@/app/collective-rewards/rewards/utils'
import { useGetCycleRewards } from '@/app/collective-rewards/shared/hooks/useGetCycleRewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'

export const TokenAmount = ({ amount, tokenSymbol, amountInFiat }: { amount: bigint; tokenSymbol: string; amountInFiat: bigint }) => {
  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <div>{formatSymbol(amount, tokenSymbol)}</div>
        <TokenImage symbol={tokenSymbol} size={16} />
        <Span>{tokenSymbol}</Span>
      </div>
      <Span variant="body-s" bold className="text-bg-0 mt-1">{formatSymbol(amountInFiat, 'USD')}</Span>
    </div>
  )
}

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
    <Metric title="Estimated Rewards" className="w-auto" containerClassName="gap-4">
      {cycleRewardsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col gap-4">
          <TokenAmount amount={rifAmount} tokenSymbol={TokenSymbol.RIF} amountInFiat={rifAmountInFiat} />
          <TokenAmount amount={rbtcAmount} tokenSymbol={TokenSymbol.RBTC} amountInFiat={rbtcAmountInFiat} />
        </div>
      )}
    </Metric>
  )
}
