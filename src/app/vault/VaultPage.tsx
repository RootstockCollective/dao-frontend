'use client'

import { VaultMetricsContainer } from './components/VaultMetricsContainer'
import { StrategiesInfo } from './components/StrategiesInfo'
import { VaultDisclaimer } from './components/VaultDisclaimer'

const NAME = 'USD Vault'

export const VaultPage = () => {
  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <div data-testid="vault-content" className="flex flex-col w-full items-start gap-6">
        <VaultDisclaimer />

        <VaultMetricsContainer />

        <StrategiesInfo />
      </div>
    </div>
  )
}
