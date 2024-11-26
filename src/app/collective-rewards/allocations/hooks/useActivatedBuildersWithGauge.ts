import { useMemo } from 'react'
import { useBuilderContext } from '../../user'

export const useActivatedBuildersWithGauge = () => {
  const { data: builders, isLoading, error } = useBuilderContext()
  const data = useMemo(
    // Not v1 and both community approved and activated
    () => {
      
      console.log(`😈 ---------------------------------------------------------------------------------------------------😈`)
      console.log(`😈 ~ file: useActivatedBuildersWithGauge.ts:13 ~ useActivatedBuildersWithGauge ~ builders:`, builders)
      console.log(`😈 ---------------------------------------------------------------------------------------------------😈`)
      
      return builders.filter(({ gauge, stateFlags }) => gauge && stateFlags && stateFlags.activated)
    },
    [builders],
  )

  return {
    data,
    isLoading,
    error,
  }
}
