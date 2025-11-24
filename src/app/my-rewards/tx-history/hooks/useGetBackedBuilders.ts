import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'
import { shortAddress } from '@/lib/utils'
import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'

type BackerToBuilderResponse = Array<{
  id: string
  backer: string
  builder: string
  totalAllocation: string
}>

/**
 * Hook to fetch builders that a specific backer has backed
 * Returns builder options formatted for the filter sidebar
 * Uses BuilderContext for builder data
 * @param address - The backer's address
 */
export const useGetBackedBuilders = (address?: Address) => {
  // Get all builders from BuilderContext
  const { builders: allBuilders, isLoading: isLoadingBuilders } = useBuilderContext()

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
        const builderAddress = builder as Address
        const builderData = allBuilders.find(b => isAddressEqual(b.address, builderAddress))

        return {
          label: builderData?.builderName || shortAddress(builderAddress),
          value: builderAddress,
        }
      })
      .filter(option => option !== null)
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [backerToBuilder, allBuilders])

  return {
    builders: builderOptions,
    isLoading: isLoadingBuilders || isLoadingRelationships,
  }
}
