import { ABIPopover } from '@/app/backing/components/Container/infoMetrics/ABIPopover'
import { Metric } from '@/app/backing/components/Metric/Metric'
import { MetricTitle } from '@/app/backing/components/Metric/MetricTitle'
import { useGetMetricsAbi } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/TypographyNew'

export const AnnualBackersIncentivesMetric = () => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbi()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })

  if (isLoading || abiPct === undefined) return <LoadingSpinner size="small" />

  return (
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
      content={<Header variant="h1">{abiPct.toFixed(0)}%</Header>}
    />
  )
}
