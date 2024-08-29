import { abiContractsMap } from '@/lib/contracts'
import { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { useCommunity } from './useCommunity'

export const useMintNFT = (nftAddress?: Address) => {
  const { tokensAvailable } = useCommunity(nftAddress)
  const { writeContractAsync: mint, isPending } = useWriteContract()

  const onMintNFT = async () => {
    if (!nftAddress) throw new Error('Unknown NFT address')
    if (!tokensAvailable) throw new Error('No NFTs available to mint')
    return await mint({
      abi: abiContractsMap[nftAddress],
      address: nftAddress || '0x0',
      functionName: 'mint',
      args: [],
    })
  }

  return { onMintNFT, isPending }
}
