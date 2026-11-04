import { ABI_INFO_TOOLTIP_CLASS_NAME, AbiInfoTooltip } from '@/app/shared/components/AnnualBackersIncentives'
import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header } from '@/components/Typography'

export const GlobalAnnualBackersIncentives = () => {
  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading }) => (
        // The Metric stays mounted while loading, so the card keeps the same width and
        // spacing instead of collapsing around a bare spinner
        <Metric
          title={
            <MetricTitle
              title="Annual Backers Incentives"
              infoIconProps={{
                tooltipClassName: ABI_INFO_TOOLTIP_CLASS_NAME,
              }}
              info={<AbiInfoTooltip />}
            />
          }
          className="pb-3 md:pb-6"
        >
          {/* Same line height as the value, so nothing jumps when it resolves */}
          <div className="flex min-h-10 items-center">
            {isLoading ? <LoadingSpinner size="small" /> : <Header variant="h1">{abiPct.toFixed(0)}%</Header>}
          </div>
        </Metric>
      )}
    />
  )
}
