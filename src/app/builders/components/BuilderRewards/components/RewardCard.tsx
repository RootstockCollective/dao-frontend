import { BuilderRewardDetails } from '@/app/collective-rewards/rewards'
import { RewardCardRenderer, type RewardType } from './RewardCardRenderer'
import { useRewardCardRealData, type RewardCardDataSource } from './rewardCardDataSources'
import { FC } from 'react'

export type { RewardType }

interface RewardCardProps {
  type: RewardType
  tokens: BuilderRewardDetails['tokens']
  builder?: BuilderRewardDetails['builder']
  gauge: BuilderRewardDetails['gauge']
  gauges: BuilderRewardDetails['gauges']
  currency?: string
  dataSource?: RewardCardDataSource
}

export const RewardCard: FC<RewardCardProps> = ({
  type,
  tokens,
  builder,
  gauge,
  gauges,
  currency,
  dataSource,
}) => {
  // Always call the hook to follow Rules of Hooks
  const realData = useRewardCardRealData(type, tokens, builder, gauge, gauges, currency)

  // Use mock data if dataSource is provided, otherwise use real data
  const rewardData = dataSource
    ? dataSource.getRewardData(type, tokens, builder, gauge, gauges, currency)
    : realData

  return <RewardCardRenderer type={type} tokens={tokens} rewardData={rewardData} />
}
