import { useGetVotingPower } from '@/app/hooks'
import { useReadBackersManager } from '@/shared/hooks/contracts'
import { useMemo } from 'react'
import { Address, zeroAddress } from 'viem'

export const useHasAvailableBacking = (backerAddress: Address) => {
  const { data: votingPower, isLoading: isVotingPowerLoading, error: votingPowerError } = useGetVotingPower()

  const {
    data: totalOnchainAllocation,
    isLoading: isTotalAllocationLoading,
    error: totalAllocationError,
  } = useReadBackersManager(
    {
      functionName: 'backerTotalAllocation',
      args: [backerAddress ?? zeroAddress],
    },
    {
      initialData: 0n,
      enabled: !!backerAddress,
    },
  )

  const availableForBacking = useMemo(
    () => (!votingPower ? 0n : (votingPower ?? 0n) - (totalOnchainAllocation ?? 0n)),
    [votingPower, totalOnchainAllocation],
  )

  return {
    hasAvailableBacking: availableForBacking > 0n,
    isLoading: isVotingPowerLoading || isTotalAllocationLoading,
    error: votingPowerError || totalAllocationError,
  }
}
