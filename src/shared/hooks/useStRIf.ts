import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'

const stRifContract = {
  abi: StRIFTokenAbi,
  address: tokenContracts.stRIF,
}

export function useStRif() {
  const { address } = useAccount()
  const { data } = useReadContracts(
    address && {
      contracts: [
        {
          ...stRifContract,
          functionName: 'balanceOf',
          args: [address],
        },
      ],
    },
  )
  return useMemo(() => {
    const [balance] = data ?? []
    return {
      stRifBalance: BigInt(balance?.result ?? 0n),
    }
  }, [data])
}
