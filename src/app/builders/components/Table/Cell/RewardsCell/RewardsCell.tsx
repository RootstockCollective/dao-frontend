import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { Paragraph } from '@/components/Typography'
import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'
import { cn, formatCurrency } from '@/lib/utils'
import { ReactNode } from 'react'

type TokenValues = Record<`${RewardTokenKey}Value`, bigint>
type TokenPrices = Record<`${RewardTokenKey}Price`, number>

export type RewardsCellProps = TokenValues &
  TokenPrices & {
    usdValue: number
    emptyPlaceholder?: ReactNode
    className?: string
  }

export const RewardsCell = ({
  className = '',
  emptyPlaceholder = null,
  usdValue,
  ...props
}: RewardsCellProps): ReactNode => {
  if (usdValue === 0) {
    return emptyPlaceholder
  }

  const tokens = REWARD_TOKEN_KEYS.map<MetricToken>(tokenKey => {
    const { symbol } = TOKENS[tokenKey]
    // TODO: this could deserve a more elegant solution.
    const value = props[`${tokenKey}Value`]
    const price = props[`${tokenKey}Price`]

    return createMetricToken({
      symbol,
      value,
      price,
    })
  })

  return (
    <div className={cn('flex flex-row items-baseline justify-center gap-1 font-rootstock-sans', className)}>
      <Paragraph>{formatCurrency(usdValue)}</Paragraph>
      <FiatTooltipLabel tooltip={{ text: <MetricTooltipContent tokens={tokens} />, side: 'top' }} />
    </div>
  )
}
