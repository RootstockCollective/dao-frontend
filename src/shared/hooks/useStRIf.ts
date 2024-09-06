import { useReadContracts, useAccount } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'

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
      stRifBalance: balance?.result ?? 0n,
    }
  }, [data])
}
