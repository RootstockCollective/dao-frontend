'use client'

import { PageBanner } from '@/components/PageBanner'

import { StrategiesInfo } from './components/StrategiesInfo'
import { VaultDisclaimer } from './components/VaultDisclaimer'
import { VaultMetricsContainer } from './components/VaultMetricsContainer'
import { VaultDepositValidationProvider } from './context'

const NAME = 'USD Vault'

export const VaultPage = () => {
  return (
    <VaultDepositValidationProvider>
      <div
        data-testid={NAME}
        className="flex flex-col items-start w-full h-full pt-[0.13rem] gap-6 rounded-sm"
      >
        <PageBanner dataTestId="VaultBanner" dismissible title={NAME} />
        <div data-testid="vault-content" className="flex flex-col w-full items-start gap-6">
          <VaultDisclaimer />

          <VaultMetricsContainer />

          <StrategiesInfo />
        </div>
      </div>
    </VaultDepositValidationProvider>
  )
}
