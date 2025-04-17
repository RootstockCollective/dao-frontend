'use client'

import { BuildersLeaderBoard } from '@/app/collective-rewards/leaderboard'
import { Metrics } from '@/app/collective-rewards/metrics'
import { ActiveBuilders } from '@/app/collective-rewards/active-builders'

export default function CollectiveRewards() {
  return (
    <div className="grid grid-rows-1 gap-[32px]">
      <Metrics />
      <ActiveBuilders />
      <BuildersLeaderBoard />
    </div>
  )
}
