import { useMemo } from 'react'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user'

export const filterBuildersByState = <T extends Builder>(
  builders: Builder[],
  stateFlags?: Partial<BuilderStateFlags>,
  includeV1 = false,
) =>
  builders.filter(({ stateFlags: builderStateFlags }) => {
    if (!builderStateFlags) return includeV1

    if (!stateFlags) return true

    return Object.keys(stateFlags).every(key => {
      const stateKey = key as keyof BuilderStateFlags
      return stateFlags[stateKey] === builderStateFlags[stateKey]
    })
  }) as T[]
