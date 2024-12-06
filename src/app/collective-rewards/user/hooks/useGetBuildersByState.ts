import { useMemo } from 'react'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user'

export const useGetBuildersByState = <T extends Builder>(
  stateFlags?: Partial<BuilderStateFlags>,
  includeV1 = false,
) => {
  const { data: builders, isLoading, error } = useBuilderContext()
  const data = useMemo(() => {
    if (!builders) return []

    return builders.filter(({ stateFlags: builderStateFlags }) => {
      if (!builderStateFlags) return includeV1

      if (!stateFlags) return true

      return Object.keys(stateFlags).every(key => {
        const stateKey = key as keyof BuilderStateFlags
        return stateFlags[stateKey] === builderStateFlags[stateKey]
      })
    })
  }, [builders, stateFlags, includeV1]) as T[]

  return {
    data,
    isLoading,
    error,
  }
}
