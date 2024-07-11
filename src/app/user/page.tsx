'use client'

import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'

export default function User() {
  return (
    <MainContainer>
      <div className="pl-[24px] pr-[10px] mb-[100px] w-full">
        <BalancesSection />
        <CommunitiesSection />
      </div>
    </MainContainer>
  )
}
