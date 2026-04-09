import { useQuery } from '@tanstack/react-query'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetActiveBuildersCount = () => {
  const { data, isLoading, error } = useQuery<{ count: number }, Error>({
    queryFn: async () => {
      const response = await fetch('/api/builders')
      if (!response.ok) {
        throw new Error('Failed to fetch active builders count')
      }
      return response.json()
    },
    queryKey: ['activeBuilders'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  return { data, isLoading, error }
}
