'use client'

import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { BoltSvg } from '@/components/BoltSvg'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { ReactNode } from 'react'

interface BoostedLabelProps {
  nftAddress: string
  children: ReactNode
}

/**
 * Client Component: Renders a dynamic label with optional "Boosted" highlighting.
 * Displays a glowing effect and a bolt icon if the provided nftAddress is boosted.
 * Otherwise, renders a standard bold text label.
 */
export function BoostedLabel({ nftAddress, children }: BoostedLabelProps) {
  const { isCampaignActive } = useNFTBoosterContext()

  return isCampaignActive(nftAddress) ? (
    <div className="inline-flex items-center gap-1">
      <GlowingLabel showGlow>{children}</GlowingLabel>
      <BoltSvg showGlow />
    </div>
  ) : (
    children
  )
}
