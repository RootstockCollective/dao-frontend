import {
  useGetABIFromChain,
  useGetMetricsAbiWithGraph,
  useGetMetricsAbiWithStateSync,
} from '@/app/collective-rewards/shared'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import Big from 'big.js'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { FC, ReactNode } from 'react'
import { withDataFallback } from '@/app/shared/components/Fallback/'

interface AnnualBackerIncentivesLoaderProps {
  render: (props: { data: Big; isLoading: boolean }) => ReactNode
}

const useFallbackWithErrors = () => {
  const { data, isLoading, error } = useGetABIFromChain()
  useHandleErrors({ error, title: 'Error loading ABI metrics' })
  return { data, isLoading, error }
}

export const AnnualBackerIncentivesLoader: FC<AnnualBackerIncentivesLoaderProps> = ({ render }) => {
  const {
    flags: { use_state_sync },
  } = useFeatureFlags()

  const usePrimary = use_state_sync ? useGetMetricsAbiWithStateSync : useGetMetricsAbiWithGraph

  const Loader = withDataFallback<Big>(usePrimary, useFallbackWithErrors)

  return <Loader render={render} />
}
