'use client'

import { MetricsContainer } from '@/components/containers'
import { VaultUserMetricsContainer } from './VaultUserMetricsContainer'
import { VaultMetrics } from './VaultMetrics'

/**
 * Container component that wraps all vault metrics in a single MetricsContainer
 *
 * Combines:
 * - VaultUserMetricsContainer: User-specific metrics (wallet balance, total supplied, vault share)
 * - VaultMetrics: General vault metrics (vault balance, APY)
 *
 * Styling:
 * - Uses MetricsContainer with background color override
 * - Disables default dividers (divide-y-0) to create a unified appearance
 *
 * @returns A unified metrics container displaying both user and general vault information
 */
export const VaultMetricsContainer = () => {
  return (
    <MetricsContainer className="bg-v3-bg-accent-80 divide-y-0">
      <div className="flex flex-col gap-6 w-full">
        <VaultMetrics />
        <VaultUserMetricsContainer />
      </div>
    </MetricsContainer>
  )
}
