'use client'
import { TreasuryContextProviderWithPrices } from '@/app/treasury/TreasuryContext'
import { TabsSection } from '@/app/treasury/TabsSection'
import { MetricsSection } from '@/app/treasury/MetricsSection'
import { HoldersSection } from '@/app/treasury/HoldersSection'

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
