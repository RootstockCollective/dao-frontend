import { CHAIN_ID } from '@/lib/constants'

export const fetchAddressTokensEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_TOKEN_BY_ADDRESS || '/address/{{address}}/tokens?chainId={{chainId}}'

export const fetchPricesEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS ||
  `/price?addresses={{addresses}}&convert={{convert}}&chainId=${CHAIN_ID}`

export const fetchNFTsOwnedByAddressAndNftAddress =
  process.env.NEXT_PUBLIC_API_RWS_NFT_BY_ADDRESS ||
  `/address/{{address}}/nfts/{{nftAddress}}?chainId=${CHAIN_ID}`

export const fetchProposalsCreatedByGovernorAddress =
  process.env.NEXT_PUBLIC_API_RWS_EVENTS_PROPOSALS_BY_ADDRESS ||
  `/address/{{address}}/eventsByTopic0?topic0=0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0&chainId=${CHAIN_ID}&fromBlock={{fromBlock}}`

export const getNftInfo =
  process.env.NEXT_PUBLIC_API_RWS_NFT_INFO || `/nfts/{{nftAddress}}?chainId=${CHAIN_ID}`
