'use client'

import { BuildersLeaderBoard } from '@/app/collective-rewards/leaderboard'
import { Metrics } from '@/app/collective-rewards/metrics'
import { WhitelistContextProvider, WhitelistSection } from '@/app/collective-rewards/whitelist'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function CollectiveRewards() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <Metrics />
        <WhitelistContextProvider>
          <WhitelistSection />
        </WhitelistContextProvider>
        <BuildersLeaderBoard />
      </div>
    </MainContainer>
  )
}
