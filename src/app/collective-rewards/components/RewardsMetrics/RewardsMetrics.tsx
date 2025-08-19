import { Label } from '@/components/Typography'
import { Metric } from '@/components/Metric'
import { FC } from 'react'
import { RBTC, RIF } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import { formatMetrics } from '../../rewards'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'

interface RewardsMetricsProps {
  title: string
  rbtcRewards: bigint
  rifRewards: bigint
}

export const RewardsMetrics: FC<RewardsMetricsProps> = ({ title, rbtcRewards, rifRewards }) => {
  const { prices } = usePricesContext()
  const rifPrice = prices[RIF]?.price ?? 0
  const { amount: rifAmount, fiatAmount: rifFiatAmount } = formatMetrics(rifRewards, rifPrice, RIF)

  const rbtcPrice = prices[RBTC]?.price ?? 0
  const { amount: rbtcAmount, fiatAmount: rbtcFiatAmount } = formatMetrics(rbtcRewards, rbtcPrice, RBTC)

  return (
    <Metric className="text-v3-text-0" title={<Label className="text-v3-bg-accent-40">{title}</Label>}>
      <div className="flex flow-row md:flex-col items-baseline gap-2 font-rootstock-sans justify-between w-full">
        <TokenAmountDisplay
          amount={rifAmount}
          tokenSymbol={RIF}
          amountInCurrency={rifFiatAmount}
          amountInCurrencyClassName="text-v3-bg-accent-40"
          isFlexEnd
        />
        <TokenAmountDisplay
          amount={rbtcAmount}
          tokenSymbol={RBTC}
          amountInCurrency={rbtcFiatAmount}
          amountInCurrencyClassName="text-v3-bg-accent-40"
          isFlexEnd
        />
      </div>
    </Metric>
  )
}
