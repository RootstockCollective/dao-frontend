import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'

export const TokenHoldingsStRIF = () => {
  const { data } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })

  const balance = useMemo(() => formatEther(data ?? 0n), [data])

  return <p>{balance} stRIF</p>
}
