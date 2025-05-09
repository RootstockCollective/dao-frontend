import { useMemo } from 'react'
import { useBuilderContext } from '../../user'

export const useActivatedBuildersWithGauge = () => {
  const { data: builders, isLoading, error } = useBuilderContext()
  const data = useMemo(
    // Not v1 and both community approved and initialized
    () => builders.filter(({ gauge, stateFlags }) => gauge && stateFlags && stateFlags.initialized),
    [builders],
  )

  return {
    data,
    isLoading,
    error,
  }
}
