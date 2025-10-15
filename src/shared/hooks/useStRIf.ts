import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { STRIF_ADDRESS } from '@/lib/constants'
import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'

export function useStRif() {
  const { address } = useAccount()
  const { data } = useReadContracts(
    address && {
      contracts: [
        {
          abi: StRIFTokenAbi,
          address: STRIF_ADDRESS,
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
