import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { currentEnvContracts } from '@/lib/contracts'
import { Address, formatUnits } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useVotingPower = (): string => {
  const { address } = useAccount()

  const result = useReadContracts({
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
    ],
  })

  if (result.isLoading) {
    return ''
  }

  const [balance, decimals] = result.data as [bigint, number]
  return formatUnits(balance, decimals)
}
