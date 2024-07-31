import { useAccount, useReadContract } from 'wagmi'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress } from '@/lib/contracts'
import { Address, formatUnits } from 'viem'

/**
 * Snapshot = blockNumber
 * @param blockNumber
 */
export const useVotingPowerAtSnapshot = (blockNumber: bigint) => {
  const { address } = useAccount()
  const { data: votingPowerAtSnapshot } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'getVotes',
    args: [address as Address, blockNumber],
  })

  return { votingPowerAtSnapshot: votingPowerAtSnapshot ? formatUnits(votingPowerAtSnapshot, 18) : '' }
}
