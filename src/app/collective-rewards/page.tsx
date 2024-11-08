'use client'

import { LeaderBoard } from '@/app/collective-rewards/leaderboard'
import { MetricsSection } from '@/app/collective-rewards/metrics'
import { WhitelistContextProviderWithBuilders, WhitelistSection } from '@/app/collective-rewards/whitelist'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <MetricsSection />
        <WhitelistContextProviderWithBuilders>
          <WhitelistSection />
        </WhitelistContextProviderWithBuilders>
        <LeaderBoard />
      </div>
    </MainContainer>
  )
}
