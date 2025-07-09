import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { RewardCardRenderer, type RewardType } from '../components/RewardCardRenderer'
import { getRewardCardMockData } from '../components/rewardCardDataSources'
import { FC } from 'react'

interface RewardCardMockProps {
  type: RewardType
  tokens: BuilderRewardDetails['tokens']
  builder?: BuilderRewardDetails['builder']
  gauge: BuilderRewardDetails['gauge']
  gauges: BuilderRewardDetails['gauges']
  currency?: string
}

export const RewardCardMock: FC<RewardCardMockProps> = ({
  type,
  tokens,
  builder,
  gauge,
  gauges,
  currency,
}) => {
  const rewardData = getRewardCardMockData(type)

  return <RewardCardRenderer type={type} tokens={tokens} rewardData={rewardData} />
}
