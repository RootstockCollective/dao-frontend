import { CHAIN_ID } from '@/lib/constants'

export const fetchAddressTokensEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_TOKEN_BY_ADDRESS || '/address/{{address}}/tokens?chainId={{chainId}}'

export const fetchPricesEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS ||
  `/price?addresses={{addresses}}&convert={{convert}}&chainId=${CHAIN_ID}`

export const fetchNFTsOwnedByAddressAndNftAddress =
  process.env.NEXT_PUBLIC_API_RWS_NFT_BY_ADDRESS ||
  `/address/{{address}}/nfts/{{nftAddress}}?chainId=${CHAIN_ID}`

const PROPOSAL_CREATED_EVENT = '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'
export const fetchProposalsCreatedByGovernorAddress =
  process.env.NEXT_PUBLIC_API_RWS_EVENTS_PROPOSALS_BY_ADDRESS ||
  `/address/{{address}}/eventsByTopic0?topic0=${PROPOSAL_CREATED_EVENT}&chainId=${CHAIN_ID}&fromBlock={{fromBlock}}`

export const getNftInfo =
  process.env.NEXT_PUBLIC_API_RWS_NFT_INFO || `/nfts/{{nftAddress}}?chainId=${CHAIN_ID}`

export const getTokenHoldersOfAddress = `/address/{{address}}/holders?chainId=${CHAIN_ID}`

export const getNftHolders = `/nfts/{{address}}/holders?chainId=${CHAIN_ID}`

const REWARD_DISTRIBUTED_EVENT = '0x57ea5c7c295b52ef3b06c69661d59c8a6d9c602ac5355cfe5e54e303c139f270'
export const fetchRewardDistributedLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${REWARD_DISTRIBUTED_EVENT}&chainId=${CHAIN_ID}&fromBlock={{fromBlock}}`

const NOTIFY_REWARD_EVENT = '0x3c0f5c48b0ffa2c570c1a0f4fbf7b0f8982213afff9eb42cd258ead865cf3c9d'
export const fetchNotifyRewardLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${NOTIFY_REWARD_EVENT}&chainId=${CHAIN_ID}&fromBlock={{fromBlock}}`
