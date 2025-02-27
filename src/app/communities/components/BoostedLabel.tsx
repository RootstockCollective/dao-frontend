'use client'

import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { BoltSvg } from '@/components/BoltSvg'
import { Span } from '@/components/Typography'
import { useIsBoosted } from '../hooks/useIsBoosted'

interface BoostedLabelProps {
  nftAddress: string
  children: string
}

/**
 * Client Component: Renders a dynamic label with optional "Boosted" highlighting.
 * Displays a glowing effect and a bolt icon if the provided nftAddress is boosted.
 * Otherwise, renders a standard bold text label.
 */
export function BoostedLabel({ nftAddress, children }: BoostedLabelProps) {
  const isBoosted = useIsBoosted(nftAddress)
  return isBoosted ? (
    <div className="inline-flex items-center">
      <GlowingLabel showGlow>{children}</GlowingLabel>
      <div className="-ml-[4px]">
        <BoltSvg showGlow />
      </div>
    </div>
  ) : (
    <Span className="text-[15px] font-bold">{children}</Span>
  )
}
