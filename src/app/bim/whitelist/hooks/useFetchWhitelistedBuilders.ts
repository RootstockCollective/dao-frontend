import { useQuery } from '@tanstack/react-query'
import { fetchWhitelistedBuilders } from '@/app/bim/actions'
import { useEffect, useState } from 'react'
import { BuilderOffChainInfo } from '@/app/bim/types'
import { BuilderStatusFilter } from '@/app/bim/whitelist/WhitelistContext'

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
}

const lowerCaseCompare = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase())

export const useFetchWhitelistedBuilders = ({ builderName, status }: FetchWhitelistedBuildersFilter) => {
  const [data, setData] = useState<BuilderOffChainInfo[]>([])
  const {
    data: remoteData,
    isLoading,
    error,
  } = useQuery({
    queryFn: fetchWhitelistedBuilders,
    queryKey: ['whitelistedBuilders'],
    refetchInterval: 10_000,
  })

  useEffect(() => {
    let filteredData = remoteData?.data || []

    if (builderName) {
      filteredData = filteredData.filter(
        ({ name, address }) => lowerCaseCompare(name, builderName) || lowerCaseCompare(address, builderName),
      )
    }

    if (status !== 'all') {
      filteredData = filteredData.filter(builder => builder.status === status)
    }

    setData(filteredData)
  }, [remoteData, builderName, status])

  return {
    data,
    isLoading,
    error,
  }
}
