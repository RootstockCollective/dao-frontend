'use client'

import { MainContainer } from '@/components/MainContainer/MainContainer'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { ProtectedContent } from '@/components/ProtectedContent/ProtectedContent'

export default function User() {
  return (
    <MainContainer>
      <ProtectedContent>
        <div className="pl-[24px] pr-[10px] mb-[100px] w-full">
          <BalancesSection />
          <CommunitiesSection />
        </div>
      </ProtectedContent>
    </MainContainer>
  )
}
