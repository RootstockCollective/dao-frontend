'use client'

import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsSection } from '@/app/bim/MetricsSection'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <MetricsSection />
        <div>
          <h3>Whitelist REPLACE ME</h3>
        </div>
        <div>
          <h3>Rewards leaderboard REPLACE ME</h3>
        </div>
      </div>
    </MainContainer>
  )
}
