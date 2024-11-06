import { Address } from 'viem'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import {
  fetchBuilderRewardsClaimedLogsByAddress,
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

export const fetchNotifyRewardLogs = (gaugeAddress: Address, fromBlock = 0) => {
  return axiosInstance.get(
    fetchNotifyRewardLogsByAddress
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
