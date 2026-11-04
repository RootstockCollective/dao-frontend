import { AnnualBackerIncentivesLoader } from '@/app/shared/components/AnnualBackersIncentivesLoader/AnnualBackerIncentivesLoader'
import { CommonComponentProps } from '@/components/commonProps'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/Typography'

import { ABI_INFO_TOOLTIP_CLASS_NAME, AbiInfoTooltip } from './AbiInfoTooltip'

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
                tooltipClassName: ABI_INFO_TOOLTIP_CLASS_NAME,
              }}
              info={<AbiInfoTooltip />}
            />
          }
          className={className}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
            <Header variant="e1">
              {isLoading ? <LoadingSpinner size="small" /> : `${abiPct.toFixed(0)}%`}
            </Header>
            <Paragraph>
              Collective Rewards is a shared incentive system that lets Backers earn by supporting Builders,
              and Builders earn by delivering impact — all powered by stRIF.
            </Paragraph>
          </div>
        </Metric>
      )}
    />
  )
}
