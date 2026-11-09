import { BigSource } from 'big.js'

import { CycleDistributionStatus, isDistributionPending } from '@/app/collective-rewards/metrics'
import { MetricBar } from '@/app/components/Metric/MetricBar'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { Header, HeaderProps } from '@/components/Typography'
import { formatCurrency } from '@/lib/utils'

import { DistributionPending } from '../DistributionPending'

interface EstimatedRewardsAmountProps {
  status: CycleDistributionStatus | undefined
  fiat: BigSource
  tokens: MetricToken[]
  headerVariant: HeaderProps['variant']
  headerClassName?: string
  /** Wraps the header in a div with these classes, as the reward cards lay their header out */
  headerWrapperClassName?: string
  barClassName?: string
}

/**
 * The fiat estimate of a cycle's rewards with its per-token bar, or "Distribution pending"
 * (without the bar) while the cycle's rewards have not been distributed.
 */
export const EstimatedRewardsAmount = ({
  status,
  fiat,
  tokens,
  headerVariant,
  headerClassName,
  headerWrapperClassName,
  barClassName,
}: EstimatedRewardsAmountProps) => {
  const header = (
    <Header variant={headerVariant} className={headerClassName}>
      {isDistributionPending(status) ? (
        <DistributionPending status={status} />
      ) : (
        <>
          {formatCurrency(fiat, { showCurrencySymbol: false })}{' '}
          <FiatTooltipLabel tooltip={{ side: 'top', text: <MetricTooltipContent tokens={tokens} /> }} />
        </>
      )}
    </Header>
  )

  return (
    <>
      {headerWrapperClassName ? <div className={headerWrapperClassName}>{header}</div> : header}
      {!isDistributionPending(status) && <MetricBar segments={tokens} className={barClassName} />}
    </>
  )
}
