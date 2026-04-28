import { useQuery } from '@tanstack/react-query'

import { useHandleErrors } from '../../utils'
import { CountMetric } from '../CountMetric'

export const ActiveBackers = () => {
  const { data, isLoading, error } = useQuery<{ count: number }, Error>({
    queryFn: async () => {
      const response = await fetch('/api/backers')
      if (!response.ok) {
        throw new Error('Failed to fetch active backers count')
      }
      return response.json()
    },
    queryKey: ['activeBackers'],
  })

  useHandleErrors({ error, title: 'Error loading active backers' })

  return (
    <CountMetric title="Active Backers" isLoading={isLoading}>
      {data?.count ?? 0}
    </CountMetric>
  )
}
