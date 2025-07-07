import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { CountMetric } from '../CountMetric'
import { useHandleErrors } from '../../utils'

export const ActiveBuilders = () => {
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

  useHandleErrors({ error, title: 'Error loading active builders' })

  return (
    <CountMetric title="Active Builders" isLoading={isLoading}>
      {data?.count}
    </CountMetric>
  )
}
