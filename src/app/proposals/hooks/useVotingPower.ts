import { GovernorAbi } from '@/lib/abis/Governor'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts, GovernorAddress } from '@/lib/contracts'
import { Address, formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = () => {
  const { address } = useAccount()

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        abi: StRIFTokenAbi,
        address: tokenContracts.stRIF,
        functionName: 'decimals',
      },
      { abi: GovernorAbi, address: GovernorAddress, functionName: 'proposalThreshold' },
    ],
  })

  if (isLoading || !data) {
    return {
      isLoading,
      votingPower: '-',
      canCreateProposal: false,
      threshold: '',
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
