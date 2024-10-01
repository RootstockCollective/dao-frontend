import { WHITELISTED_BUILDERS_URL } from '@/lib/constants'
import axios from 'axios'
import { BuilderOffChainInfo } from '@/app/bim/types'
import { encodeEventTopics } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { axiosInstance } from '@/lib/utils'

export const fetchWhitelistedBuilders = () => axios.get<BuilderOffChainInfo[]>(`${WHITELISTED_BUILDERS_URL}`)

export const fetchRewardDistributedLogs = () => {
  const topic = encodeEventTopics({
    abi: SimplifiedRewardDistributorAbi,
    eventName: 'RewardDistributed',
  })[0]

  return axiosInstance.get(`address/${SimplifiedRewardDistributorAddress}/eventsByTopic0?topic0=${topic}`)
}
