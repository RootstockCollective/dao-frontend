import { useMemo } from 'react'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user'

export type BuilderStateFlagsKeys = keyof BuilderStateFlags
export type BuilderStateFlagsArray = Array<BuilderStateFlagsKeys>
export const useGetBuildersByState = <T extends Builder>(
  stateFlags?: BuilderStateFlagsArray,
  includeV1 = false,
) => {
  const { data: builders, isLoading, error } = useBuilderContext()
  const data = useMemo(() => {
    if (!builders) return []

    return builders.filter(({ stateFlags: builderStateFlags }) => {
      if (!builderStateFlags) return includeV1

      if (!stateFlags) return true

      return stateFlags.some(value => builderStateFlags[value])
    })
  }, [builders, stateFlags, includeV1]) as T[]

  return {
    data,
    isLoading,
    error,
  }
}
