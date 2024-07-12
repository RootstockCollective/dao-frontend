import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { currentEnvContracts } from '@/lib/contracts'
import { Address } from 'viem'
import { useAccount, useReadContracts } from 'wagmi'

export const useStRIFBalance = () => {
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
    ],
  })

  if (isLoading) {
    return {
      isLoading: true,
      balance: BigInt(0),
      decimals: 0,
    }
  }

  const [balance, decimals] = data as [bigint, number]
  return {
    isLoading: false,
    balance,
    decimals,
  }
}
