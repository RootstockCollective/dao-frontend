import {
  useGetABIFromChain,
  useGetMetricsAbiWithGraph,
  useGetMetricsAbiWithStateSync,
} from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { CommonComponentProps } from '@/components/commonProps'
import { Metric } from '@/components/Metric/Metric'
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner'
import { Typography } from '@/components/TypographyNew/Typography'
import Big from 'big.js'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ErrorBoundary } from 'react-error-boundary'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { FC } from 'react'

interface AnnualBackerIncentivesProps {
  render: (props: { abiPct: Big; isLoading: boolean }) => React.ReactNode
}

const ABIFromChain = ({ render }: AnnualBackerIncentivesProps) => {
  const { data: abiPct, isLoading, error } = useGetABIFromChain()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  return <>{render({ abiPct, isLoading })}</>
}

const ABIWTheGraph = ({ render }: AnnualBackerIncentivesProps) => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithGraph()
  if (error) throw error
  return <>{render({ abiPct, isLoading })}</>
}

const ABIWStateSync = ({ render }: AnnualBackerIncentivesProps) => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithStateSync()
  if (error) throw error
  return <>{render({ abiPct, isLoading })}</>
}

export const AnnualBackerIncentives: FC<AnnualBackerIncentivesProps> = ({ render }) => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()

  return (
    <ErrorBoundary fallbackRender={withFallbackRetry(<ABIFromChain render={render} />)}>
      {use_state_sync ? <ABIWStateSync render={render} /> : <ABIWTheGraph render={render} />}
    </ErrorBoundary>
  )
}
