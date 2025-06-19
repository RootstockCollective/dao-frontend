'use client'

import { BuildersLeaderBoard } from '@/app/collective-rewards/leaderboard'
import { Metrics } from '@/app/collective-rewards/metrics'
import { ActiveBuilders } from '@/app/collective-rewards/active-builders'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { CollectiveRewardsPage } from './CollectiveRewardsPage'

const CollectiveRewardsOld = () => (
  <div className="grid grid-rows-1 gap-[2rem]">
    <Metrics />
    <ActiveBuilders />
    <BuildersLeaderBoard />
  </div>
)

export default function CollectiveRewards() {
  const {
    flags: { v3_design },
  } = useFeatureFlags()

  return v3_design ? <CollectiveRewardsPage /> : <CollectiveRewardsOld />
}
