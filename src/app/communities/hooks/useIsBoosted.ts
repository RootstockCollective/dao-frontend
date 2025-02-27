import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'

/**
 * Client Hook: Determines whether a given nftAddress is in a "boosted" state.
 * Retrieves the active campaign and boost data from the NFTBoosterContext.
 */
export function useIsBoosted(nftAddress: string) {
  const { hasActiveCampaign, boostData } = useNFTBoosterContext()
  return hasActiveCampaign && boostData?.nftContractAddress === nftAddress
}
