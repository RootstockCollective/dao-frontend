import {
  useGetABIFromChain,
  useGetMetricsAbiWithGraph,
  useGetMetricsAbiWithStateSync,
} from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import KotoQuestionMarkIcon from '@/components/Icons/KotoQuestionMarkIcon'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Metric, MetricTitle } from '@/components/Metric'
import { Header, Paragraph } from '@/components/TypographyNew'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { FC } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Big from '@/lib/big'
import { ABIFormula } from '../ABIFormula'

interface AnnualBackersIncentivesContentProps {
  abiPct: Big
  isLoading: boolean
}

const AnnualBackersIncentivesContent: FC<AnnualBackersIncentivesContentProps> = ({ abiPct, isLoading }) => {
  if (isLoading) return <LoadingSpinner size="small" />

  return (
    <Metric
      title={
        <MetricTitle
          title="Annual Backers Incentives"
          infoIconProps={{
            tooltipClassName: 'max-w-sm text-sm',
          }}
          info={
            <Paragraph className="text-[14px] font-normal text-left">
              The Annual Backers Incentives (%) represents an estimate of the annualized percentage of rewards
              that backers could receive based on their backing allocations.
              <br />
              <br />
              The calculation follows the formula:
              <span className="flex justify-center pt-4">
                <ABIFormula />
              </span>
              <br />
              <br />
              This estimation is dynamic and may vary based on total rewards and user activity. This data is
              for informational purposes only.
            </Paragraph>
          }
        />
      }
      className="pb-6"
      content={<Header variant="h1">{abiPct.toFixed(0)}%</Header>}
    />
  )
}

const ABIMetricsFromChain = () => {
  const { data: abiPct, isLoading, error } = useGetABIFromChain()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })

  return <AnnualBackersIncentivesContent abiPct={abiPct} isLoading={isLoading} />
}

const ABIMetricsWTheGraph = () => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithGraph()

  if (error) throw error

  return <AnnualBackersIncentivesContent abiPct={abiPct} isLoading={isLoading} />
}

const ABIMetricsWStateSync = () => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithStateSync()

  if (error) throw error

  return <AnnualBackersIncentivesContent abiPct={abiPct} isLoading={isLoading} />
}

export const AnnualBackersIncentivesMetric = () => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()

  return (
    <ErrorBoundary fallbackRender={withFallbackRetry(<ABIMetricsFromChain />)}>
      {use_state_sync ? <ABIMetricsWStateSync /> : <ABIMetricsWTheGraph />}
    </ErrorBoundary>
  )
}
