'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TreasurySection } from '@/app/treasury/TreasurySection'
import { TotalTokenHoldingsSection } from '@/app/treasury/TotalTokenHoldingsSection'

export default function Treasury() {
  return (
    <MainContainer>
      <TreasuryContextProviderWithPrices>
        <div className="pl-[24px] grid grid-rows-1 gap-[32px] mb-[100px]">
          <TreasurySection />
          <TotalTokenHoldingsSection />
        </div>
      </TreasuryContextProviderWithPrices>
    </MainContainer>
  )
}
