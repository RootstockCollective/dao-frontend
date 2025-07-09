'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TabsSection } from '@/app/treasury/sections/TabsSection'
import { MetricsSection } from '@/app/treasury/sections/MetricsSection'
import { HoldersSection } from '@/app/treasury/sections/HoldersSection'

export default function Treasury() {
  return (
    <TreasuryContextProviderWithPrices>
      <div className="pl-2 flex flex-col gap-12">
        <MetricsSection />
        <TabsSection />
        <HoldersSection />
      </div>
    </TreasuryContextProviderWithPrices>
  )
}
