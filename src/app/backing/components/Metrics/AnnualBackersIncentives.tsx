import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/TypographyNew'
import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ABIFormula } from '@/app/collective-rewards/shared/components/ABI/ABIFormula'

export const AnnualBackersIncentives = () => {
  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading }) =>
        isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
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
                    This estimation is dynamic and may vary based on total rewards and user activity. This
                    data is for informational purposes only.
                  </Paragraph>
                }
              />
            }
            className="pb-6"
          >
            <Header variant="h1">{abiPct.toFixed(0)}%</Header>
          </Metric>
        )
      }
    />
  )
}
