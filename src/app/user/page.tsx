'use client'
import { BalancesSection } from '@/app/user/Balances/BalancesSection'
import { CommunitiesSection } from '@/app/user/Communities/CommunitiesSection'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TxStatusMessage } from '@/components/TxStatusMessage'

export default function User() {
  return (
    <MainContainer>
      <TxStatusMessage messageType="staking" />
      <div className="pl-[24px] pr-[10px] mb-[100px] w-full">
        <BalancesSection />
        <CommunitiesSection />
      </div>
    </MainContainer>
  )
}
