import { useEffect, useState } from 'react'
import { BuilderStatusFilter } from '@/app/collective-rewards/whitelist'
import { BuilderProposal, useBuilderContext } from '@/app/collective-rewards/user'

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())

export const useGetFilteredBuilders = ({
  builderName: filterBuilderName,
  status: filterStatus,
}: FetchWhitelistedBuildersFilter) => {
  const [data, setData] = useState<BuilderProposal[]>([])
  const { data: builders, isLoading, error } = useBuilderContext()

  useEffect(() => {
    let filteredBuilders = builders

    if (filterBuilderName) {
      filteredBuilders = filteredBuilders.filter(
        ({ builderName, address }) =>
          // TODO: Here we filter by both name and address,
          // but the address is not displayed in the UI when the Builder name is present.
          lowerCaseCompare(builderName, filterBuilderName) || lowerCaseCompare(address, filterBuilderName),
      )
    }

    if (filterStatus !== 'all') {
      filteredBuilders = filteredBuilders.filter(builder => builder.status === filterStatus)
    }

    setData(filteredBuilders)
  }, [builders, filterBuilderName, filterStatus])

  return {
    data,
    isLoading,
    error,
  }
}
