import { ABIPopover } from '@/app/backing/components/Popovers/ABIPopover'
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
import { Header } from '@/components/TypographyNew'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { FC } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Big from '@/lib/big'

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
