import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useCidsAvailable = (nftAddress: Address | undefined) => {
  const { data } = useReadContract({
    abi: abiContractsMap[nftAddress?.toLowerCase() as string],
    address: nftAddress,
    functionName: 'cidsAvailable',
  })

  return { cidsAvailable: (data || 0n) as bigint }
}
