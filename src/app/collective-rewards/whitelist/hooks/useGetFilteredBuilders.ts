import { BuilderStateDetails } from '@/app/collective-rewards/types'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { BuilderStatusFilter } from '@/app/collective-rewards/whitelist'
import { useMemo } from 'react'

type FetchWhitelistedBuildersFilter = {
  builderName?: string
  status: BuilderStatusFilter
  stateFlags?: Partial<Record<keyof BuilderStateDetails, boolean>>
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())

export const useGetFilteredBuilders = ({
  builderName: filterBuilderName = '',
  status: filterStatus,
  stateFlags,
}: FetchWhitelistedBuildersFilter) => {
  const { data: builders, isLoading, error } = useBuilderContext()

  const data = useMemo(() => {
    let filteredBuilders = builders

    if (filterBuilderName) {
      filteredBuilders = filteredBuilders.filter(
        ({ builderName, address }) =>
          // TODO: Here we filter by both name and address,
          // but the address is not displayed in the UI when the Builder name is present.
          lowerCaseCompare(builderName, filterBuilderName) || lowerCaseCompare(address, filterBuilderName),
      )
    }

    if (stateFlags) {
      for (const key in stateFlags) {
        const stateKey = key as keyof BuilderStateDetails
        if (stateFlags[stateKey]) {
          filteredBuilders = filteredBuilders.filter(builder => builder.stateDetails?.[stateKey])
        }
      }
    }
    if (filterStatus !== 'all') {
      filteredBuilders = filteredBuilders.filter(builder => builder.status === filterStatus)
    }
    return filteredBuilders
  }, [builders, filterBuilderName, filterStatus, stateFlags])

  return {
    data,
    isLoading,
    error,
  }
}
