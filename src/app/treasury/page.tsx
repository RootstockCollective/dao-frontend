'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/contexts/TreasuryContext'
import { HoldersSection } from '@/app/treasury/sections/holders-section'
import { MetricsSection } from '@/app/treasury/sections/MetricsSection'
import { TabsSection } from '@/app/treasury/sections/TabsSection'

export default function Treasury() {
  return (
    <TreasuryContextProviderWithPrices>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-10 p-6 bg-bg-80 rounded-md">
          <MetricsSection />
          <TabsSection />
        </div>
        <HoldersSection />
      </div>
    </TreasuryContextProviderWithPrices>
  )
}
