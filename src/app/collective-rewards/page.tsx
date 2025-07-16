'use client'

import { Metrics } from '@/app/collective-rewards/metrics'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { CollectiveRewardsPage } from './CollectiveRewardsPage'

const CollectiveRewardsOld = () => (
  <div className="grid grid-rows-1 gap-[2rem]">
    <Metrics />
  </div>
)

export default function CollectiveRewards() {
  const {
    flags: { v3_design },
  } = useFeatureFlags()

  return v3_design ? <CollectiveRewardsPage /> : <CollectiveRewardsOld />
}
