'use client'

import { BuildersLeaderBoard } from '@/app/collective-rewards/leaderboard'
import { Metrics } from '@/app/collective-rewards/metrics'
import { WhitelistContextProviderWithBuilders, WhitelistSection } from '@/app/collective-rewards/whitelist'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <Metrics />
        <WhitelistContextProviderWithBuilders>
          <WhitelistSection />
        </WhitelistContextProviderWithBuilders>
        <BuildersLeaderBoard />
      </div>
    </MainContainer>
  )
}
