import { useQuery } from '@tanstack/react-query'
import { useGetBuilders } from '@/app/collective-rewards/user/hooks/useGetBuilders'
import { useMemo } from 'react'
import { Address } from 'viem'
import { shortAddress } from '@/lib/utils'

type BackerToBuilderResponse = Array<{
  id: string
  backer: string
  builder: string
  totalAllocation: string
}>

/**
 * Hook to fetch builders that a specific backer has backed
 * Returns builder options formatted for the filter sidebar
 * @param address - The backer's address
 */
export const useGetBackedBuilders = (address?: Address) => {
  // Fetch all builders with their names
  const { data: allBuilders, isLoading: isLoadingBuilders } = useGetBuilders()

  // Fetch the backer-to-builder relationships
  const { data: backerToBuilder, isLoading: isLoadingRelationships } = useQuery<
    BackerToBuilderResponse,
    Error
  >({
    queryFn: async (): Promise<BackerToBuilderResponse> => {
      if (!address) {
        return []
      }

      const response = await fetch(`/api/backers/${address}/backer-to-builder`)

      if (!response.ok) {
        throw new Error('Failed to fetch backed builders')
      }

      const body = await response.json()
      return body.data
    },
    queryKey: ['backerToBuilder', address],
    enabled: !!address,
  })

  // Transform the data into filter options
  const builderOptions = useMemo(() => {
    if (!backerToBuilder || !allBuilders) {
      return []
    }

    return backerToBuilder
      .map(({ builder }) => {
        const builderKey = Object.keys(allBuilders).find(k => k.toLowerCase() === builder.toLowerCase())
        const builderData = builderKey ? allBuilders[builderKey as Address] : undefined

        return {
          label: builderData?.builderName || shortAddress(builder as Address),
          value: builder,
        }
      })
      .filter((option): option is { label: string; value: string } => option !== null)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [backerToBuilder, allBuilders])

  return {
    builders: builderOptions,
    isLoading: isLoadingBuilders || isLoadingRelationships,
  }
}
