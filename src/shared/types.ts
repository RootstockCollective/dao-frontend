import { Address } from 'viem'

/**
 * NFT metadata properties from JSON metadata files
 */
export interface NftMeta {
  /**
   * Token name
   */
  name: string
  /**
   * Image URL
   */
  image: string
  /**
   * Token unique description
   */
  description: string
  /**
   * Early Adopters community project URL
   */
  external_url: string
  /**
   * Company name (Rootstock Labs)
   */
  creator: string
}
/**
 * useCommunity hook return properties
 */
export interface CommunityData {
  /**
   * The remaining number of tokens that can be minted
   */
  tokensAvailable: number
  /**
   * Number of community members who received tokens
   */
  membersCount: number
  /**
   * Tells whether the user is a member of the community
   */
  isMember: boolean
  /**
   * Serial number of the token minted for the user
   */
  tokenId: number | undefined
  /**
   * NFT smart contract name
   */
  nftName: string | undefined
  /**
   * Symbol of the Early Adopters NFT
   */
  nftSymbol: string | undefined
  mint: {
    /**
     * Function to mint new token
     */
    onMintNFT: () => Promise<Address>
    /**
     * Flag indicating that NFT is being minted
     */
    isPending: boolean
  }
  /**
   * NFT Metadata
   */
  nftMeta: NftMeta | undefined
}
