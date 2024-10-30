'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TreasurySection } from '@/app/treasury/TreasurySection'
import { TotalTokenHoldingsSection } from '@/app/treasury/TotalTokenHoldingsSection'
import { MetricsSection } from '@/app/treasury/MetricsSection'
import { HoldersSection } from '@/app/treasury/HoldersSection'

export default function Treasury() {
  return (
    <MainContainer>
      <TreasuryContextProviderWithPrices>
        <div className="grid grid-rows-1 gap-[32px]">
          <TreasurySection />
          <TotalTokenHoldingsSection />
          <MetricsSection />
          <HoldersSection />
        </div>
      </TreasuryContextProviderWithPrices>
    </MainContainer>
  )
}
