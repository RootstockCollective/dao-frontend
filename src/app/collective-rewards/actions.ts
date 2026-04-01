'use server'

import type { Address, Hex } from 'viem'

import { fetchLogsByTopic } from '@/lib/blockscout/fetchLogsByTopic'
import { EVENTS_FROM_BLOCK } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'

// keccak256('NotifyReward(address,uint256,uint256)')
const GAUGE_NOTIFY_REWARD_EVENT: Hex = '0x3c0f5c48b0ffa2c570c1a0f4fbf7b0f8982213afff9eb42cd258ead865cf3c9d'

// keccak256('BuilderRewardsClaimed(address,address,uint256)')
const BUILDER_REWARDS_CLAIMED_EVENT: Hex =
  '0xc309438e69ba53ef6afef64839bd1ab1acc4a9a8fd28c8e0356075ca66f72c1b'

// keccak256('BackerRewardsClaimed(address,address,uint256)')
const BACKER_REWARDS_CLAIMED_EVENT: Hex = '0x72421f1eeaa316f3b67618996c0df193d45328d3645bb1866b6beb11a0c8230e'

// keccak256('RewardDistributionFinished(address)')
const REWARD_DISTRIBUTION_FINISHED: Hex = '0x2e0a637781c44a621d21ae02c97a62860799594e47e453e0491eb348ebf83bff'

// keccak256('RewardDistributionRewards(address,uint256)')
const REWARD_DISTRIBUTION_REWARDS: Hex = '0xd6a836213168f39ab7f02eb32044ca51969fe036e85cf25737139ec6b1580d91'

const defaultFromBlock = EVENTS_FROM_BLOCK.toString()

export const fetchGaugeNotifyRewardLogs = async (gaugeAddress: Address, fromBlock = 0) => {
  return fetchLogsByTopic({
    address: gaugeAddress,
    topic0: GAUGE_NOTIFY_REWARD_EVENT,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
  })
}

export const fetchBuilderRewardsClaimed = async (gaugeAddress: Address, fromBlock = 0) => {
  return fetchLogsByTopic({
    address: gaugeAddress,
    topic0: BUILDER_REWARDS_CLAIMED_EVENT,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
  })
}

export const fetchBackerRewardsClaimed = async (gaugeAddress: Address, fromBlock = 0) => {
  return fetchLogsByTopic({
    address: gaugeAddress,
    topic0: BACKER_REWARDS_CLAIMED_EVENT,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
  })
}

export const fetchRewardDistributionFinished = async (fromBlock = 0) => {
  return fetchLogsByTopic({
    address: BackersManagerAddress,
    topic0: REWARD_DISTRIBUTION_FINISHED,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
  })
}

export const fetchRewardDistributionRewards = async (fromBlock = 0) => {
  return fetchLogsByTopic({
    address: BackersManagerAddress,
    topic0: REWARD_DISTRIBUTION_REWARDS,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
  })
}
