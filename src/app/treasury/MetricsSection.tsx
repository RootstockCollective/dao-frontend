import { HeaderTitle, Typography } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { useStRifHoldings } from './hooks/useStRifHoldings'
import { millify, fullDenominations } from '@/lib/utils'

/**
 * Displays key treasury metrics including total stRIF, funding/treasury balance,
 * and total value locked (TVL) in USD.
 */
export const MetricsSection = () => {
  const { stRifBalance, stRifUsdBalance, totalFundingUsd, tvlUsd } = useStRifHoldings()
  return (
    <div>
      <HeaderTitle className="mb-4">Metrics</HeaderTitle>
      <div className="flex flex-row gap-4">
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Total stRIF</Typography>}
          amount={`${millify(stRifBalance)} STRIF`}
          fiatAmount={`= USD ${millify(stRifUsdBalance, ' ', fullDenominations)}`}
          borderless
        />
        <MetricsCard
          className="max-w-[214px] min-w-[120px]"
          title={<Typography className="text-sm font-bold">Funding/Treasury</Typography>}
          amount={`${millify(totalFundingUsd)} USD`}
          borderless
        />
        <MetricsCard
          className="max-w-[444px] min-w-[120px]"
          title={
            <p>
              <Typography tagVariant="span" className="text-sm font-bold">
                TVL{' '}
              </Typography>
              <Typography tagVariant="span" className="text-sm">
                (Total stRIF + Funding/Treasury)
              </Typography>
            </p>
          }
          amount={`${millify(tvlUsd)} USD`}
          borderless
        />
      </div>
    </div>
  )
}
