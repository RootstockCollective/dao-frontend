import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/Typography'

import { ABIFormula } from '../ABIFormula'

/** `className` lets the page swap the divider spacing when the metrics are laid out in a row. */
export const GlobalAnnualBackersIncentives = ({ className = 'pb-3 md:pb-6' }: { className?: string }) => {
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
                tooltipClassName: 'max-w-sm text-sm',
              }}
              info={
                <Paragraph className="text-[14px] font-normal text-left">
                  The Annual Backers Incentives (%) represents an estimate of the annualized percentage of
                  rewards that backers could receive based on their backing allocations.
                  <br />
                  <br />
                  The calculation follows the formula:
                  <span className="flex justify-center pt-4">
                    <ABIFormula />
                  </span>
                  <br />
                  <br />
                  This estimation is dynamic and may vary based on total rewards and user activity. This data
                  is for informational purposes only.
                </Paragraph>
              }
            />
          }
          className={className}
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
