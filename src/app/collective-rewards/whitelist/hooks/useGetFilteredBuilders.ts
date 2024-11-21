import { BuilderStateFlags } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { BuilderStatusFilter } from '@/app/collective-rewards/whitelist'
import { useMemo } from 'react'

type BuilderStateFlagsKeys = keyof BuilderStateFlags

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
  stateFlags?: Array<BuilderStateFlagsKeys & 'v1'>
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())

export const useGetFilteredBuilders = ({
  builderName: filterBuilderName,
  status: filterStatus,
  stateFlags,
}: FetchWhitelistedBuildersFilter) => {
  const { data: builders, isLoading, error } = useBuilderContext()

  const data = useMemo(() => {
    let filteredBuilders = builders

    if (stateFlags) {
      filteredBuilders = filteredBuilders.filter(({ stateFlags: builderStateFlags }) => {
        if (!builderStateFlags) {
          return false
        }
        Object.entries(stateFlags).every(
          ([key, value]) => builderStateFlags[key as BuilderStateFlagsKeys] === value,
        )
      })
    }

    if (filterBuilderName) {
      filteredBuilders = filteredBuilders.filter(
        ({ proposal: { builderName }, address }) =>
          // TODO: Here we filter by both name and address,
          // but the address is not displayed in the UI when the Builder name is present.
          lowerCaseCompare(builderName, filterBuilderName) || lowerCaseCompare(address, filterBuilderName),
      )
    }

    /*   if (filterStatus !== 'all') {
      filteredBuilders = filteredBuilders.filter(builder => builder.stateFlags === filterStatus)
    } */
    return filteredBuilders
  }, [builders, filterBuilderName, filterStatus, stateFlags])

  return {
    data,
    isLoading,
    error,
  }
}
