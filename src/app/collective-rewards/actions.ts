// TODO: move to utils
import { Address } from 'viem'
import { BackersManagerAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import {
  fetchBackerRewardsClaimedLogsByAddress,
  fetchBuilderRewardsClaimedLogsByAddress,
  fetchGaugeNotifyRewardLogsByAddress,
  fetchNotifyRewardLogsByAddress,
  fetchRewardDistributionFinishedLogsByAddress,
} from '@/lib/endpoints'

export const fetchNotifyRewardLogs = (fromBlock = 0) => {
  return axiosInstance.get(
    fetchNotifyRewardLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchGaugeNotifyRewardLogs = (gaugeAddress: Address, fromBlock = 0) => {
  return axiosInstance.get(
    fetchGaugeNotifyRewardLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBuilderRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return axiosInstance.get(
    fetchBuilderRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchBackerRewardsClaimed = (gaugeAddress: Address, fromBlock = 0) => {
  return axiosInstance.get(
    fetchBackerRewardsClaimedLogsByAddress
      .replace('{{address}}', gaugeAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributionFinished = (fromBlock = 0) => {
  return axiosInstance.get(
    fetchRewardDistributionFinishedLogsByAddress
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}
