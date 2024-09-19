export const fetchAddressTokensEndpoint = process.env.NEXT_PUBLIC_API_RWS_TOKEN_BY_ADDRESS || ''

export const fetchPricesEndpoint = process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS || ''

export const fetchNFTsOwnedByAddressAndNftAddress = process.env.NEXT_PUBLIC_API_RWS_NFT_BY_ADDRESS || ''

export const fetchProposalsCreatedByGovernorAddress =
  process.env.NEXT_PUBLIC_API_RWS_EVENTS_PROPOSALS_BY_ADDRESS || ''

export const getNftInfo = process.env.NEXT_PUBLIC_API_RWS_NFT_INFO || ''
