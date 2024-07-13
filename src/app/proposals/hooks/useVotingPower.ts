import { GovernorAbi } from '@/lib/abis/Governor'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { currentEnvContracts, GovernorAddress } from '@/lib/contracts'
import { Address, formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = () => {
  const { address } = useAccount()

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: currentEnvContracts.stRIF as Address,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        abi: StRIFTokenAbi,
        address: currentEnvContracts.stRIF as Address,
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
    ],
  })

  if (isLoading) {
    return {
      isLoading: true,
      votingPower: '-',
      canCreateProposal: false,
      threshold: undefined,
    }
  }

  const [balance, decimals, threshold] = data as [bigint, number, bigint]
  return {
    isLoading: false,
    votingPower: formatUnits(balance, decimals),
    canCreateProposal: balance >= threshold,
    threshold: formatUnits(threshold, decimals),
  }
}
