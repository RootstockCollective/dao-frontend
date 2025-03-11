'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TabsTreasurySection } from '@/app/treasury/TabsTreasurySection'
import { TotalTokenHoldingsSection } from '@/app/treasury/TotalTokenHoldingsSection'
import { MetricsSection } from '@/app/treasury/MetricsSection'
import { HoldersSection } from '@/app/treasury/HoldersSection'

export default function Treasury() {
  return (
    <TreasuryContextProviderWithPrices>
      <div className="grid grid-rows-1 gap-[32px]">
        <TotalTokenHoldingsSection />
        <MetricsSection />
        <TabsTreasurySection />
        <HoldersSection />
      </div>
    </TreasuryContextProviderWithPrices>
  )
}
