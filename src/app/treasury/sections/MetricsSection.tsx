import { HeaderTitle } from '@/components/Typography'
import { Label } from '@/components/Typography'
import { formatCurrencyWithLabel, formatNumberWithCommas } from '@/lib/utils'
import { BalanceInfo } from '@/components/BalanceInfo'
import { useStRifHoldings } from '../hooks/useStRifHoldings'

/**
 * Displays key treasury metrics including total stRIF, treasury balance,
 * and total value locked (TVL) in USD.
 */
export const MetricsSection = () => {
  const { stRifBalance, stRifUsdBalance, totalFundingUsd, tvlUsd } = useStRifHoldings()
  return (
    <>
      <HeaderTitle variant="h3" caps>
        Metrics
      </HeaderTitle>
      <div className="flex flex-row flex-wrap gap-6">
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="Total stRIF"
          amount={`${formatNumberWithCommas(stRifBalance)}`}
          symbol="stRIF"
          fiatAmount={formatCurrencyWithLabel(stRifUsdBalance)}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title="Treasury"
          amount={`${formatNumberWithCommas(totalFundingUsd)}`}
          symbol="USD"
        />
        <BalanceInfo
          className="max-w-[444px] min-w-[180px] overflow-visible"
          title="TVL"
          tooltipContent={
            <>
              <Label variant="body-s">Total value locked</Label>
              <Label variant="body-s"> (Total stRIF + Treasury)</Label>
            </>
          }
          amount={`${formatNumberWithCommas(tvlUsd)}`}
          symbol="USD"
        />
      </div>
    </>
  )
}
