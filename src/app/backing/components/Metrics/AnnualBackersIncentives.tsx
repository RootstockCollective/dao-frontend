import { ABIPopover } from '@/app/backing/components/Popovers/ABIPopover'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header } from '@/components/TypographyNew'
import { AnnualBackerIncentives } from '@/app/shared/components/AnnualBackersIncentives/AnnualBackerIncentives'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export const AnnualBackersIncentives = () => {
  return (
    <AnnualBackerIncentives
      render={({ abiPct, isLoading }) =>
        isLoading ? (
          <LoadingSpinner size="small" />
        ) : (
          <Metric
            title={
              <MetricTitle
                title="Annual Backers Incentives"
                info={
                  <ABIPopover>
                    <KotoQuestionMarkIcon className="cursor-pointer" />
                  </ABIPopover>
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
