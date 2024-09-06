import { useQuery } from '@tanstack/react-query'
import { fetchWhitelistedBuilders } from '@/app/bim/actions'

export const useFetchWhitelistedBuilders = () =>
  useQuery({
    queryFn: fetchWhitelistedBuilders,
    queryKey: ['whitelistedBuilders'],
    // TODO: refetchInterval may be longer
    refetchInterval: 2000,
  })
