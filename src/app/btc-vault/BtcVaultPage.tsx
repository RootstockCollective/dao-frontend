'use client'

import { useAccount } from 'wagmi'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { BtcVaultBanners } from './BtcVaultBanners'
import { BtcVaultMetrics } from './components/BtcVaultMetrics'
import { EligibilityIndicator } from './components/EligibilityIndicator'
import { useActionEligibility } from './hooks/useActionEligibility'

const NAME = 'BTC Vault'

export const BtcVaultPage = () => {
  const { address, isConnected } = useAccount()
  const { data: actionEligibility } = useActionEligibility(address)

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <BtcVaultBanners />

      <section data-testid="btc-vault-metrics" className="w-full">
        <SectionContainer title="VAULT METRICS" headerVariant="h3">
          <BtcVaultMetrics />
        </SectionContainer>
      </section>

      {isConnected && actionEligibility && <EligibilityIndicator eligibility={actionEligibility} />}

      <section data-testid="btc-vault-dashboard" className="w-full">
        {/* BTC Vault Dashboard - F4 */}
      </section>

      <section data-testid="btc-vault-actions" className="w-full">
        {/* BTC Vault Actions - F5 */}
      </section>

      <section data-testid="btc-vault-request-queue" className="w-full">
        {/* BTC Vault Request Queue - F9 */}
      </section>

      <section data-testid="btc-vault-history" className="w-full">
        {/* BTC Vault History - F10 */}
      </section>
    </div>
  )
}
