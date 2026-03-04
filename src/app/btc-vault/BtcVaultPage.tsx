'use client'

import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { BtcVaultBanners } from './BtcVaultBanners'
import { BtcVaultDashboard } from './components/BtcVaultDashboard'

const NAME = 'BTC Vault'

export const BtcVaultPage = () => {
  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <BtcVaultBanners />

      {/* Vault Metrics Zone - F3 */}
      <section data-testid="btc-vault-metrics" className="w-full">
        <SectionContainer title="VAULT METRICS" headerVariant="h3">
          <BtcVaultMetrics />
        </SectionContainer>
      </section>

      {/* Dashboard Zone - F4 */}
      <BtcVaultDashboard />

      {/* Actions Zone - F5/F6 */}
      <section data-testid="btc-vault-actions" className="w-full">
        {/* BTC Vault Actions (Deposit/Withdraw) - implemented in F5/F6 */}
      </section>

      {/* Request Queue Zone - F9 */}
      <section data-testid="btc-vault-request-queue" className="w-full">
        {/* BTC Vault Request Queue - implemented in F9 */}
      </section>

      {/* History Zone - F10 */}
      <section data-testid="btc-vault-history" className="w-full">
        {/* BTC Vault History - implemented in F10 */}
      </section>
    </div>
  )
}
