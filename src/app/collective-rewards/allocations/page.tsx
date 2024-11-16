'use client'

import { MainContainer } from '@/components/MainContainer/MainContainer'
import { AllocationAmount } from './AllocationAmount'
import { AllocationMetrics } from './AllocationMetrics'
import { Header } from './Header'

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <div className="flex flex-col justify-center items-start self-stretch gap-2">
          <Header />
        </div>
        <div className="flex flex-col items-start gap-6 self-stretch">
          <AllocationMetrics />
          <AllocationAmount />
        </div>
      </div>
    </MainContainer>
  )
}
