import {
  useGetABIFromChain,
  useGetMetricsAbiWithGraph,
  useGetMetricsAbiWithStateSync,
} from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import Big from 'big.js'
import { withFallbackRetry } from '@/app/shared/components/Fallback/FallbackWithRetry'
import { ErrorBoundary } from 'react-error-boundary'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { FC, ReactNode } from 'react'

interface AnnualBackerIncentivesLoaderProps {
  render: (props: { abiPct: Big; isLoading: boolean }) => ReactNode
}

const ABIFromChain = ({ render }: AnnualBackerIncentivesLoaderProps) => {
  const { data: abiPct, isLoading, error } = useGetABIFromChain()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  return <>{render({ abiPct, isLoading })}</>
}

const ABIWTheGraph = ({ render }: AnnualBackerIncentivesLoaderProps) => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithGraph()
  if (error) throw error
  return <>{render({ abiPct, isLoading })}</>
}

const ABIWStateSync = ({ render }: AnnualBackerIncentivesLoaderProps) => {
  const { data: abiPct, isLoading, error } = useGetMetricsAbiWithStateSync()
  if (error) throw error
  return <>{render({ abiPct, isLoading })}</>
}

export const AnnualBackerIncentivesLoader: FC<AnnualBackerIncentivesLoaderProps> = ({ render }) => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()

  return (
    <ErrorBoundary fallbackRender={withFallbackRetry(<ABIFromChain render={render} />)}>
      {use_state_sync ? <ABIWStateSync render={render} /> : <ABIWTheGraph render={render} />}
    </ErrorBoundary>
  )
}
