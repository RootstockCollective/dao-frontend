'use client'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { ActiveRequestSection } from './ActiveRequestSection'
import { BtcVaultBanners } from './BtcVaultBanners'
import { BtcVaultMetrics } from './components/BtcVaultMetrics'

const NAME = 'BTC Vault'

export const BtcVaultPage = () => {
  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <BtcVaultBanners />
      {/* Active Request Zone - F7 (STORY-EPIC-7-001) */}
      <ActiveRequestSection />
      {/* Vault Metrics Zone - F3 */}
      <section data-testid="btc-vault-metrics" className="w-full">
        <SectionContainer title="VAULT METRICS" headerVariant="h3">
          <BtcVaultMetrics />
        </SectionContainer>
      </section>

      {/* Dashboard Zone - F4 */}
      <section data-testid="btc-vault-dashboard" className="w-full">
        {/* BTC Vault Dashboard - implemented in F4 */}
      </section>

      {/* Actions Zone - F5/F6 */}
      <section data-testid="btc-vault-actions" className="w-full">
        {/* BTC Vault Actions (Deposit/Withdraw) - implemented in F5/F6 */}
      </section>

      {/* History Zone - F10 */}
      <section data-testid="btc-vault-history" className="w-full">
        {/* BTC Vault History - implemented in F10 */}
      </section>
    </div>
  )
}
