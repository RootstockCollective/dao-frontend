import { useQuery } from '@tanstack/react-query'

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
  })

  return { data, isLoading, error }
}
