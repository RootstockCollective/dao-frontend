import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { RewardCardRenderer, type RewardType } from '../components/RewardCardRenderer'
import { getRewardCardMockData } from '../components/rewardCardDataSources'
import { FC } from 'react'

interface RewardCardMockProps {
  type: RewardType
  tokens: BuilderRewardDetails['tokens']
}

export const RewardCardMock: FC<RewardCardMockProps> = ({
  type,
  tokens,
}) => {
  const rewardData = getRewardCardMockData(type)

  return <RewardCardRenderer type={type} tokens={tokens} rewardData={rewardData} />
}
