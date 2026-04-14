'use client'

import { useAccount } from 'wagmi'

import { SectionContainer } from '@/app/communities/components/SectionContainer'

import { ActiveRequestSection } from './components/request-processing/ActiveRequestSection'
import { BtcVaultBanners } from './BtcVaultBanners'
import { BtcVaultDashboard } from './components/BtcVaultDashboard'
import { BtcVaultMetrics } from './components/BtcVaultMetrics'
import { CapitalAllocationSection } from './components/capital-allocation/CapitalAllocationSection'
import { BtcVaultDisclosureSection } from './components/disclosure/BtcVaultDisclosureSection'
import { BtcVaultWalletDisconnectedSection } from './components/disclosure/BtcVaultWalletDisconnectedSection'
import { useActiveRequests } from './hooks/useActiveRequests'

const NAME = 'BTC Vault'

export const BtcVaultPage = () => {
  const { address } = useAccount()
  const { data: activeRequests, refetch: refetchActiveRequests } = useActiveRequests(address)
  return (
    <div
      data-testid={NAME} // TODO: DAO-2029 Standardize data-test-ids to using kebab-case only
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <BtcVaultBanners />
      {/* Active Request Zone - F7 (STORY-EPIC-7-001) */}
      <ActiveRequestSection data={activeRequests} />
      {/* Vault Metrics Zone - F3 */}
      <section data-testid="btc-vault-metrics" className="w-full">
        <SectionContainer title="VAULT METRICS" headerVariant="h3">
          <BtcVaultMetrics />
        </SectionContainer>
      </section>

      {/* Dashboard Zone - F4 */}
      <BtcVaultDashboard onRequestSubmitted={refetchActiveRequests} />

      {/* Capital Allocation Transparency - DAO-2017 */}
      <CapitalAllocationSection />

      {/* Request Queue Zone - F9 */}
      <section data-testid="btc-vault-request-queue" className="w-full">
        {/* BTC Vault Request Queue - implemented in F9 */}
      </section>

      {/* History Zone - F10 */}
      <section data-testid="btc-vault-history" className="w-full">
        {/* BTC Vault History - implemented in F10 */}
      </section>

      <BtcVaultWalletDisconnectedSection />
      <BtcVaultDisclosureSection />
    </div>
  )
}
