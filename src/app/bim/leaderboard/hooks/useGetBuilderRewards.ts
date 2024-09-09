import { fetchWhitelistedBuilders } from '@/app/bim/actions'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

// TODO: if first epoch 0, else a predefined value for the MVP (where do we read it from?)
const fixedReward = 100
// TODO: constant value for the MVP (where do we read it from?)
const projectedReward = 200
// TODO: ration between builder's reward and total reward (where do we read it from?)
const fixedPerformance = 100

type BuilderReward = {
  name: string
  lastEpochReward: number
  projectedReward: number
  performance: number
}

export const useGetBuilderRewards = () => {
  const [data, setData] = useState<BuilderReward[]>([])

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
    let builders = remoteData?.data || []

    const data: BuilderReward[] = builders.map(builder => ({
      name: builder.name,
      lastEpochReward: fixedReward,
      projectedReward: projectedReward,
      performance: fixedPerformance,
    }))

    setData(data)
  }, [remoteData])

  return {
    data,
    isLoading,
    error,
  }
}
