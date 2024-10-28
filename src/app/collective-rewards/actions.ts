import { encodeEventTopics } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'

export const fetchRewardDistributedLogs = (fromBlock = 0) => {
  const topic = encodeEventTopics({
    abi: SimplifiedRewardDistributorAbi,
    eventName: 'RewardDistributed',
  })[0]

  return axiosInstance.get(
    `address/${SimplifiedRewardDistributorAddress}/eventsByTopic0?topic0=${topic}&fromBlock=${fromBlock}`,
  )
}

export const fetchRewardDistributedCached = () =>
  axiosInstance.get('/reward-distributed/api', { baseURL: '/' })
