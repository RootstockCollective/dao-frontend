import { useMemo } from 'react'
import { useBuilderContext } from '../../user'

export const useActivatedBuildersWithGauge = () => {
  const { data: builders, isLoading, error } = useBuilderContext()
  const data = useMemo(
    // Not v1 and both community approved and activated
    () => builders.filter(({ gauge, stateFlags }) => gauge && stateFlags && stateFlags.activated),
    [builders],
  )

  return {
    data,
    isLoading,
    error,
  }
}
