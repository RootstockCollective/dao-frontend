'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TabsSection } from '@/app/treasury/sections/TabsSection'
import { MetricsSection } from '@/app/treasury/sections/MetricsSection'
import { HoldersSection } from '@/app/treasury/sections/HoldersSection'

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
