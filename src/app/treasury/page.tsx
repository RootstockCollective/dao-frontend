'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TreasurySection } from '@/app/treasury/TreasurySection'
import { TotalTokenHoldingsSection } from '@/app/treasury/TotalTokenHoldingsSection'
import { MetricsSection } from '@/app/treasury/MetricsSection'
import { HoldersSection } from '@/app/treasury/HoldersSection'
import { TabsTreasurySection } from '@/app/treasury/TabsTreasurySection'

export default function Treasury() {
  return (
    <TreasuryContextProviderWithPrices>
      <div className="grid grid-rows-1 gap-[32px]">
        <TreasurySection />
        <TabsTreasurySection />
        <TotalTokenHoldingsSection />
        <MetricsSection />
        <HoldersSection />
      </div>
    </TreasuryContextProviderWithPrices>
  )
}
