import Big from 'big.js'
import { ReactNode } from 'react'

import {
  useGetABIFromChain,
  useGetMetricsAbiWithGraph,
  useGetMetricsAbiWithStateSync,
} from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { withDataFallback } from '@/app/shared/components/Fallback/'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'

interface AnnualBackerIncentivesLoaderProps {
  render: (props: { data: Big; isLoading: boolean }) => ReactNode
}

const useFallbackWithErrors = () => {
  const { data, isLoading, error } = useGetABIFromChain()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  return { data, isLoading, error }
}

export const AnnualBackerIncentivesLoader = ({ render }: AnnualBackerIncentivesLoaderProps) => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()

  // TODO: remove conditional hooks
  const usePrimary = use_state_sync ? useGetMetricsAbiWithStateSync : useGetMetricsAbiWithGraph

  const Loader = withDataFallback<Big>(usePrimary, useFallbackWithErrors)

  return <Loader render={render} />
}
