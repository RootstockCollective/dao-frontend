import { ABIPopover } from '@/app/backing/components/Popovers/ABIPopover'
import { useGetMetricsAbi } from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
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
