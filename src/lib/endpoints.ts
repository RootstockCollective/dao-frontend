import { CHAIN_ID, EVENTS_FROM_BLOCK } from '@/lib/constants'

/**
 * Appends `chainId=${CHAIN_ID}` as a query parameter to a URL string.
 * If the URL already contains a `chainId` param (in any format), it is left unchanged.
 */
function withChainId(url: string): string {
  if (url.includes('chainId')) return url
  return url + (url.includes('?') ? '&' : '?') + `chainId=${CHAIN_ID}`
}

const FROM_BLOCK_PARAM = `fromBlock=${EVENTS_FROM_BLOCK}`

export const fetchPricesEndpoint = withChainId(
  process.env.NEXT_PUBLIC_API_RWS_PRICES_BY_ADDRESS || '/price?addresses={{addresses}}&convert={{convert}}',
)

// keccak256('ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)')
export const PROPOSAL_CREATED_EVENT = '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'
export const fetchProposalsCreatedByGovernorAddress = withChainId(
  process.env.NEXT_PUBLIC_API_RWS_EVENTS_PROPOSALS_BY_ADDRESS ||
    `/address/{{address}}/eventsByTopic0?topic0=${PROPOSAL_CREATED_EVENT}&fromBlock={{fromBlock}}`,
)

// keccak256('VoteCast(address,uint256,uint8,uint256,string)')
const CAST_VOTE_EVENT = '0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4'
export const fetchVoteCastEventEndpoint = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${CAST_VOTE_EVENT}&topic1={{topic1}}&topic01Opr=and`,
)

// keccak256('NotifyReward(address,uint256,uint256)')
const GAUGE_NOTIFY_REWARD_EVENT = '0x3c0f5c48b0ffa2c570c1a0f4fbf7b0f8982213afff9eb42cd258ead865cf3c9d'
export const fetchGaugeNotifyRewardLogsByAddress = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${GAUGE_NOTIFY_REWARD_EVENT}&${FROM_BLOCK_PARAM}`,
)

// keccak256('BuilderRewardsClaimed(address,address,uint256)')
const BUILDER_REWARDS_CLAIMED_EVENT = '0xc309438e69ba53ef6afef64839bd1ab1acc4a9a8fd28c8e0356075ca66f72c1b'
export const fetchBuilderRewardsClaimedLogsByAddress = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${BUILDER_REWARDS_CLAIMED_EVENT}&${FROM_BLOCK_PARAM}`,
)

// keccak256('BackerRewardsClaimed(address,address,uint256)')
const BACKER_REWARDS_CLAIMED_EVENT = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'
export const fetchBackerRewardsClaimedLogsByAddress = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${BACKER_REWARDS_CLAIMED_EVENT}&${FROM_BLOCK_PARAM}`,
)

// keccak256('RewardDistributionFinished(address)')
const REWARD_DISTRIBUTION_FINISHED = '0x2e0a637781c44a621d21ae02c97a62860799594e47e453e0491eb348ebf83bff'
export const fetchRewardDistributionFinishedLogsByAddress = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${REWARD_DISTRIBUTION_FINISHED}&${FROM_BLOCK_PARAM}`,
)

export const getStakingHistoryEndpoint = `/api/staking/v1/addresses/{{address}}/history`

const REWARD_DISTRIBUTION_REWARDS = '0xd6a836213168f39ab7f02eb32044ca51969fe036e85cf25737139ec6b1580d91'
export const fetchRewardDistributionRewardsLogsByAddress = withChainId(
  `/address/{{address}}/eventsByTopic0?topic0=${REWARD_DISTRIBUTION_REWARDS}&${FROM_BLOCK_PARAM}`,
)
export const getVaultHistoryEndpoint = `/api/vault/v1/addresses/{{address}}/history`

export const getBtcVaultEpochHistoryEndpoint = `/api/btc-vault/v1/epoch-history`
export const getBtcVaultHistoryEndpoint = `/api/btc-vault/v1/history`
export const getBtcVaultWhitelistRoleHistoryEndpoint = `/api/btc-vault/v1/whitelist-role-history`
