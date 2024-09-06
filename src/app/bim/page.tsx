'use client'

import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsSection } from '@/app/bim/MetricsSection'
import { WhitelistSection } from '@/app/bim/whitelist/WhitelistSection'
import { WhitelistContextProvider } from '@/app/bim/whitelist/WhitelistContext'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <MetricsSection />
        <WhitelistContextProvider>
          <WhitelistSection />
        </WhitelistContextProvider>
        <div>
          <h3>Rewards leaderboard REPLACE ME</h3>
        </div>
      </div>
    </MainContainer>
  )
}
