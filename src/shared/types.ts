import { Address } from 'viem'
import { TX_MESSAGES } from './txMessages'

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
   * Call function to read data from the smart contract
   */
  onReadFunctions: (functions: { functionName: string; args: string[] }[]) => Promise<any>
  /**
   * NFT Metadata
   */
  nftMeta: NftMeta | undefined
  /**
   * Necessary amount of StRIFs to get a reward NFT
   */
  stRifThreshold?: bigint
  isLoading: boolean
}

export enum ProposalState {
  Pending,
  Active,
  Canceled,
  Defeated,
  Succeeded,
  Queued,
  Expired,
  Executed,
}

export type TxMessage =
  (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES][keyof (typeof TX_MESSAGES)[keyof typeof TX_MESSAGES]]

export type TxStatus = 'info' | 'success' | 'error'

export type TxAction = keyof typeof TX_MESSAGES

export enum ProposalCategory {
  Grants = 'Grants',
  Builder = 'Builder',
  Treasury = 'Treasury',
}
