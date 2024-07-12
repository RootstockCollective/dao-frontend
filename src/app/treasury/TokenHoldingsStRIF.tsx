import { useReadContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { currentEnvContracts } from '@/lib/contracts'
import { Address, formatEther, parseEther } from 'viem'
import { useMemo } from 'react'

export const TokenHoldingsStRIF = () => {
  const { data } = useReadContract({
    abi: StRIFTokenAbi,
    address: currentEnvContracts.stRIF as Address,
    functionName: 'totalSupply',
  })

  const balance = useMemo(() => formatEther(data ?? 0n), [data])

  return <p>{balance} stRIF</p>
}
