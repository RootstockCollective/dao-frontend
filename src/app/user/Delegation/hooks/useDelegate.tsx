import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: tokenContracts.stRIF,
}

export const useDelegate = (address: Address | undefined) => {
  const { data: delegateeAddress } = useReadContract(
    address && {
      ...stRifContract,
      functionName: 'delegates',
      args: [address],
    },
  )

  return { delegateeAddress }
}
