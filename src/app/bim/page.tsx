'use client'

import { LeaderBoard } from '@/app/bim/leaderboard/LeaderBoard'
import { LeaderBoardContextProviderWithPrices } from '@/app/bim/leaderboard/LeaderBoardContext'
import { MetricsSection } from '@/app/bim/MetricsSection'
import { WhitelistContextProvider } from '@/app/bim/whitelist/WhitelistContext'
import { WhitelistSection } from '@/app/bim/whitelist/WhitelistSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <MetricsSection />
        <WhitelistContextProvider>
          <WhitelistSection />
        </WhitelistContextProvider>
        <LeaderBoardContextProviderWithPrices>
          <LeaderBoard />
        </LeaderBoardContextProviderWithPrices>
      </div>
    </MainContainer>
  )
}
