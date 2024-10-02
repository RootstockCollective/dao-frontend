import { useEffect, useState } from 'react'
import { BuilderInfo } from '@/app/bim/types'
import { BuilderStatusFilter } from '@/app/bim/whitelist/WhitelistContext'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
}

const lowerCaseCompare = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase())

export const useGetFilteredBuilders = ({ builderName, status }: FetchWhitelistedBuildersFilter) => {
  const [data, setData] = useState<BuilderInfo[]>([])
  const { data: builders, isLoading, error } = useGetBuilders()

  useEffect(() => {
    let filteredData = builders

    if (builderName) {
      filteredData = filteredData.filter(
        ({ name, address }) => lowerCaseCompare(name, builderName) || lowerCaseCompare(address, builderName),
      )
    }

    if (status !== 'all') {
      filteredData = filteredData.filter(builder => builder.status === status)
    }

    setData(filteredData)
  }, [builders, builderName, status])

  return {
    data,
    isLoading,
    error,
  }
}
