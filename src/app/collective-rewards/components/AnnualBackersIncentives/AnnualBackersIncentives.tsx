import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Typography } from '@/components/TypographyNew/Typography'
import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { Metric } from '@/components/Metric'

interface AnnualBackersIncentivesProps extends CommonComponentProps {}

export const AnnualBackersIncentives = ({ className }: AnnualBackersIncentivesProps) => {
  return (
    <AnnualBackerIncentivesLoader
      render={({ data: abiPct, isLoading }) => (
        <Metric title="Annual Backers Incentives" className={className}>
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
