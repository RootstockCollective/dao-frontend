import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Typography } from '@/components/TypographyNew/Typography'
import { AnnualBackerIncentives } from '@/app/shared/components/AnnualBackersIncentives/AnnualBackerIncentives'
import { Metric } from '@/components/Metric'

interface AnnualBackersIncentivesProps extends CommonComponentProps {}

export const AnnualBackersIncentives = ({ className }: AnnualBackersIncentivesProps) => {
  return (
    <AnnualBackerIncentives
      render={({ abiPct, isLoading }) => (
        <Metric title="Annual Backers Incentives" className={className}>
          <div className="flex flex-row gap-10 items-center">
            <Typography variant="e1" className="text-center">
              {isLoading ? <LoadingSpinner size="small" /> : `${abiPct.toFixed(0)}%`}
            </Typography>
            <Typography>
              What this is, why it is important, how it works... Lorem ipsum dolor sit amet con sectetur
              adipiscing elit. Cras non dolor ut sapien dictum.
            </Typography>
          </div>
        </Metric>
      )}
    />
  )
}
