import { CHAIN_ID, EVENTS_FROM_BLOCK } from '@/lib/constants'
import { ethers } from 'ethers'

const CHAIN_ID_PARAM = `chainId=${CHAIN_ID}`
const FROM_BLOCK_PARAM = `fromBlock=${EVENTS_FROM_BLOCK}`

export const fetchAddressTokensEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_TOKEN_BY_ADDRESS || '/address/{{address}}/tokens?chainId={{chainId}}'

export const fetchPricesEndpoint =
  process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS ||
  `/price?addresses={{addresses}}&convert={{convert}}&${CHAIN_ID_PARAM}`

export const fetchNFTsOwnedByAddressAndNftAddress =
  process.env.NEXT_PUBLIC_API_RWS_NFT_BY_ADDRESS ||
  `/address/{{address}}/nfts/{{nftAddress}}?${CHAIN_ID_PARAM}`

const PROPOSAL_CREATED_EVENT = '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'
export const fetchProposalsCreatedByGovernorAddress =
  process.env.NEXT_PUBLIC_API_RWS_EVENTS_PROPOSALS_BY_ADDRESS ||
  `/address/{{address}}/eventsByTopic0?topic0=${PROPOSAL_CREATED_EVENT}&${CHAIN_ID_PARAM}&fromBlock={{fromBlock}}`

const CAST_VOTE_EVENT = '0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4'
export const fetchVoteCastEventEndpoint = `/address/{{address}}/eventsByTopic0?topic0=${CAST_VOTE_EVENT}&${CHAIN_ID_PARAM}&topic1={{topic1}}&topic01Opr=and`

export const getNftInfo = process.env.NEXT_PUBLIC_API_RWS_NFT_INFO || `/nfts/{{nftAddress}}?${CHAIN_ID_PARAM}`

const NEW_ALLOCATION_EVENT = ethers.id('NewAllocation(address,address,uint256)')
export const fetchNewAllocationEventEndpoint = `/address/{{address}}/eventsByTopic0?topic0=${NEW_ALLOCATION_EVENT}&chainId=${CHAIN_ID}&topic1={{topic1}}&topic01Opr=and`

export const getTokenHoldersOfAddress = `/address/{{address}}/holders?${CHAIN_ID_PARAM}`

export const getNftHolders = `/nfts/{{address}}/holders?${CHAIN_ID_PARAM}`

const NOTIFY_REWARD_EVENT = '0xf70d5c697de7ea828df48e5c4573cb2194c659f1901f70110c52b066dcf50826'
export const fetchNotifyRewardLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${NOTIFY_REWARD_EVENT}&${CHAIN_ID_PARAM}&${FROM_BLOCK_PARAM}`

const GAUGE_NOTIFY_REWARD_EVENT = '0x3c0f5c48b0ffa2c570c1a0f4fbf7b0f8982213afff9eb42cd258ead865cf3c9d'
export const fetchGaugeNotifyRewardLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${GAUGE_NOTIFY_REWARD_EVENT}&${CHAIN_ID_PARAM}&${FROM_BLOCK_PARAM}`

const BUILDER_REWARDS_CLAIMED_EVENT = '0xc309438e69ba53ef6afef64839bd1ab1acc4a9a8fd28c8e0356075ca66f72c1b'
export const fetchBuilderRewardsClaimedLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${BUILDER_REWARDS_CLAIMED_EVENT}&${CHAIN_ID_PARAM}&${FROM_BLOCK_PARAM}`

const BACKER_REWARDS_CLAIMED_EVENT = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'
export const fetchBackerRewardsClaimedLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${BACKER_REWARDS_CLAIMED_EVENT}&${CHAIN_ID_PARAM}&${FROM_BLOCK_PARAM}`

const REWARD_DISTRIBUTION_FINISHED = '0x2e0a637781c44a621d21ae02c97a62860799594e47e453e0491eb348ebf83bff'
export const fetchRewardDistributionFinishedLogsByAddress = `/address/{{address}}/eventsByTopic0?topic0=${REWARD_DISTRIBUTION_FINISHED}&${CHAIN_ID_PARAM}&${FROM_BLOCK_PARAM}`

export const fetchCrTheGraphEndpoint = `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`
