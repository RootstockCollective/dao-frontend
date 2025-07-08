import { useAccount, useReadContracts } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address, formatUnits } from 'viem'

/**
 * Snapshot = blockNumber
 * @param blockNumber
 */
export const useVotingPowerAtSnapshot = (blockNumber: bigint) => {
  const { address } = useAccount()
  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: GovernorAbi,
        address: GovernorAddress,
        functionName: 'getVotes',
        args: [address as Address, blockNumber],
      },
    ],
    query: {
      refetchInterval: 5000,
    },
  })

  if (isLoading || !data) {
    return {
      votingPowerAtSnapshot: BigInt(0),
      doesUserHasEnoughThreshold: false,
    }
  }

  const [votingPowerAtSnapshot] = data

  return {
    votingPowerAtSnapshot,
    doesUserHasEnoughThreshold: votingPowerAtSnapshot > 0,
  }
}
