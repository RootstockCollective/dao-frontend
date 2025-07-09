import { KotoQuestionMarkIcon } from '@/components/Icons'
import { Popover } from '@/components/Popover'
import { HeaderTitle } from '@/components/Typography'
import { Label } from '@/components/TypographyNew'
import { formatNumberWithCommas } from '@/lib/utils'
import { MetricCard } from '../components/MetricCard'
import { useStRifHoldings } from '../hooks/useStRifHoldings'

/**
 * Displays key treasury metrics including total stRIF, treasury balance,
 * and total value locked (TVL) in USD.
 */
export const MetricsSection = () => {
  const { stRifBalance, stRifUsdBalance, totalFundingUsd, tvlUsd } = useStRifHoldings()
  return (
    <div className="bg-bg-80 p-6">
      <HeaderTitle variant="h3" caps>
        Metrics
      </HeaderTitle>
      <div className="flex flex-row gap-6 mt-10">
        <MetricCard
          className="max-w-[214px] min-w-[180px]"
          title="Total stRIF"
          amount={`${formatNumberWithCommas(stRifBalance)}`}
          symbol="stRIF"
          fiatAmount={`${formatNumberWithCommas(stRifUsdBalance)} USD`}
        />
        <MetricCard
          className="max-w-[214px] min-w-[180px]"
          title="Treasury"
          amount={`${formatNumberWithCommas(totalFundingUsd)}`}
          symbol="USD"
        />
        <MetricCard
          className="max-w-[444px] min-w-[180px] overflow-visible"
          title="TVL"
          titlePopover={
            <Popover
              contentContainerClassName="w-max"
              trigger="hover"
              content={
                <>
                  <Label variant="body-s">Total value locked</Label>
                  <Label variant="body-s"> (Total stRIF + Treasury)</Label>
                </>
              }
            >
              <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
            </Popover>
          }
          amount={`${formatNumberWithCommas(tvlUsd)}`}
          symbol="USD"
        />
      </div>
    </div>
  )
}
