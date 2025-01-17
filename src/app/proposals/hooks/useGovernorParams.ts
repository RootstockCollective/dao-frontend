import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGovernorParams = () => {
  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
      {
        abi: GovernorAbi,
        address: GovernorAddress,
        functionName: 'guardian',
      },
      {
        abi: GovernorAbi,
        address: GovernorAddress,
        functionName: 'name',
      },
      {
        abi: GovernorAbi,
        address: GovernorAddress,
        functionName: 'owner',
      },
    ],
  })

  if (isLoading || !data) {
    return {
      isLoading,
      threshold: BigInt(0),
    }
  }

  const [threshold, guardian, name, owner] = data as [bigint, Address, string, Address]

  return {
    isLoading: false,
    threshold,
    name,
    guardian,
    owner,
  }
}
