import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Typography } from '@/components/TypographyNew/Typography'
import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { Metric, MetricTitle } from '@/components/Metric'
import { Paragraph } from '@/components/TypographyNew'
import { ABIFormula } from '@/app/backing/components/ABIFormula'

interface AnnualBackersIncentivesProps extends CommonComponentProps {}

export const AnnualBackersIncentives = ({ className }: AnnualBackersIncentivesProps) => {
  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading }) => (
        <Metric
          title={
            <MetricTitle
              title="Annual Backers Incentives"
              infoIconProps={{
                tooltipClassName: 'max-w-sm text-sm',
              }}
              info={
                <Paragraph className="text-sm font-normal text-left">
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
          <div className="flex flex-row gap-10 items-center">
            <Typography variant="e1" className="text-center">
              {isLoading ? <LoadingSpinner size="small" /> : `${abiPct.toFixed(0)}%`}
            </Typography>
            <Typography>
              Collective Rewards is a shared incentive system that lets Backers earn by supporting Builders,
              and Builders earn by delivering impact — all powered by stRIF.
            </Typography>
          </div>
        </Metric>
      )}
    />
  )
}
