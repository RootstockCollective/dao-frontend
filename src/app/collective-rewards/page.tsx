'use client'

import { LeaderBoard } from '@/app/collective-rewards/leaderboard/LeaderBoard'
import { MetricsSection } from '@/app/collective-rewards/MetricsSection'
import { WhitelistContextProvider } from '@/app/collective-rewards/whitelist/WhitelistContext'
import { WhitelistSection } from '@/app/collective-rewards/whitelist/WhitelistSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <MetricsSection />
        <WhitelistContextProvider>
          <WhitelistSection />
        </WhitelistContextProvider>
        <LeaderBoard />
      </div>
    </MainContainer>
  )
}
