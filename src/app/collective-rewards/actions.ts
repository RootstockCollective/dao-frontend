import { Address } from 'viem'
import { BackersManagerAddress, SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import {
  fetchBuilderRewardsClaimedLogsByAddress,
  fetchGaugeNotifyRewardLogsByAddress,
  fetchNotifyRewardLogsByAddress,
  fetchRewardDistributedLogsByAddress,
} from '@/lib/endpoints'

export const fetchRewardDistributedLogs = (fromBlock = 0) => {
  return axiosInstance.get(
    fetchRewardDistributedLogsByAddress
      .replace('{{address}}', SimplifiedRewardDistributorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributedCached = () =>
  axiosInstance.get('/reward-distributed/api', { baseURL: '/' })

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
