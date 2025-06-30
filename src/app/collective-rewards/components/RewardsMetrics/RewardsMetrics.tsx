import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { formatCurrency } from '@/lib/utils'
import { Typography } from '@/components/TypographyNew/Typography'
import { Header } from '@/components/TypographyNew'
import { Metric } from '@/components/Metric'
import { FC } from 'react'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context/PricesContext'
import Big from 'big.js'

interface RewardsMetricsProps {
  title: string
  rbtcRewards: bigint
  rifRewards: bigint
}

export const RewardsMetrics: FC<RewardsMetricsProps> = ({ title, rbtcRewards, rifRewards }) => {
  const { prices } = usePricesContext()
  const estimatedRewards = Big(rifRewards.toString())
    .mul(prices.RIF?.price ?? 0)
    .plus(Big(rbtcRewards.toString()).mul(prices.RBTC?.price ?? 0))
    .div(WeiPerEther.toString())
    .toString()

  return (
    <Metric className="text-v3-text-0" title={<Typography variant="body">{title}</Typography>}>
      <div className="flex flex-row items-baseline gap-2 font-rootstock-sans">
        <Header>{formatCurrency(estimatedRewards)}</Header>
        <RifRbtcTooltip rbtcValue={rbtcRewards} rifValue={rifRewards}>
          <DottedUnderlineLabel className="text-lg">USD</DottedUnderlineLabel>
        </RifRbtcTooltip>
      </div>
    </Metric>
  )
}
