import { useQuery } from '@tanstack/react-query'
import { fetchWhitelistedBuilders } from '@/app/bim/actions'

export const useGetWhitelistedBuilders = () => {
  const { data, isLoading, error } = useQuery({
    queryFn: fetchWhitelistedBuilders,
    queryKey: ['whitelistedBuilders'],
    refetchInterval: 30_000,
  })

  return {
    data,
    isLoading,
    error,
  }
}
