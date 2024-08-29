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
