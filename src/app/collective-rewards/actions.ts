import { encodeEventTopics } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'
import { fetchRewardDistributedLogsByAddress } from '@/lib/endpoints'

export const fetchRewardDistributedLogs = (fromBlock = 0) => {
  const topic = encodeEventTopics({
    abi: SimplifiedRewardDistributorAbi,
    eventName: 'RewardDistributed',
  })[0]

  return axiosInstance.get(
    fetchRewardDistributedLogsByAddress
      .replace('{{address}}', SimplifiedRewardDistributorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )
}

export const fetchRewardDistributedCached = () =>
  axiosInstance.get('/reward-distributed/api', { baseURL: '/' })
