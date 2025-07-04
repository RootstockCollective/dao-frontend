import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { CountMetric } from '../CountMetric'
import { useHandleErrors } from '../../utils'

export const ActiveBackers = () => {
  const { data, isLoading, error } = useQuery<{ count: number }, Error>({
    queryFn: async () => {
      const response = await fetch('/api/backers')
      if (!response.ok) {
        throw new Error('Failed to fetch ABI data')
      }
      return response.json()
    },
    queryKey: ['activeBackers'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  useHandleErrors({ error, title: 'Error loading active backers' })

  return (
    <CountMetric title="Active Backers" isLoading={isLoading}>
      {data?.count}
    </CountMetric>
  )
}
