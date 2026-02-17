import { Address } from 'viem'
import { BackersManagerAddress } from '@/lib/contracts'
import { fetchClient } from '@/lib/utils'
import {
  fetchBackerRewardsClaimedLogsByAddress,
  fetchBuilderRewardsClaimedLogsByAddress,
  fetchGaugeNotifyRewardLogsByAddress,
  fetchRewardDistributionFinishedLogsByAddress,
  fetchRewardDistributionRewardsLogsByAddress,
} from '@/lib/endpoints'

/* eslint-disable @typescript-eslint/no-explicit-any -- these endpoints return event logs consumed by viem's parseEventLogs which expects (Log | RpcLog)[] */
export const fetchGaugeNotifyRewardLogs = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchClient.get<any>(
    fetchGaugeNotifyRewardLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBuilderRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchClient.get<any>(
    fetchBuilderRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBackerRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return fetchClient.get<any>(
    fetchBackerRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributionFinished = (fromBlock = 0) => {
  return fetchClient.get<any>(
    fetchRewardDistributionFinishedLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributionRewards = (fromBlock = 0) => {
  return fetchClient.get<any>(
    fetchRewardDistributionRewardsLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}
