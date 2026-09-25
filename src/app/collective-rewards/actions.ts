'use server'

import type { Hex } from 'viem'

import { fetchLogsByTopic } from '@/lib/blockscout/fetch-logs-by-topic'
import { EVENTS_FROM_BLOCK } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'

// keccak256('RewardDistributionFinished(address)')
const REWARD_DISTRIBUTION_FINISHED: Hex = '0x2e0a637781c44a621d21ae02c97a62860799594e47e453e0491eb348ebf83bff'

// keccak256('RewardDistributionRewards(address,uint256)')
const REWARD_DISTRIBUTION_REWARDS: Hex = '0xd6a836213168f39ab7f02eb32044ca51969fe036e85cf25737139ec6b1580d91'

const defaultFromBlock = EVENTS_FROM_BLOCK.toString()

const REVALIDATE_SECONDS = 25

export const fetchRewardDistributionFinished = async (fromBlock = 0) => {
  return fetchLogsByTopic({
    address: BackersManagerAddress,
    topic0: REWARD_DISTRIBUTION_FINISHED,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
    fetchInit: { next: { revalidate: REVALIDATE_SECONDS } },
  })
}

export const fetchRewardDistributionRewards = async (fromBlock = 0) => {
  return fetchLogsByTopic({
    address: BackersManagerAddress,
    topic0: REWARD_DISTRIBUTION_REWARDS,
    fromBlock: fromBlock > 0 ? fromBlock.toString() : defaultFromBlock,
    fetchInit: { next: { revalidate: REVALIDATE_SECONDS } },
  })
}
