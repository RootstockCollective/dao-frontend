'use client'

import { PropsWithChildren } from 'react'

import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { cn } from '@/lib/utils'

interface BoostedBoxProps extends PropsWithChildren {
  nftAddress: string
}

/**
 * Client Component: Wraps community card with a styled container.
 * Adds a glowing shadow effect if the provided nftAddress is in a "boosted" state.
 */
export function BoostedBox({ nftAddress, children }: BoostedBoxProps) {
  const { isCampaignActive } = useNFTBoosterContext()
  return (
    <div
      className={cn(
        'overflow-hidden h-full',
        isCampaignActive(nftAddress) && 'shadow-[0px_0px_20.799999237060547px_0px_rgba(192,247,255,0.43)]',
      )}
    >
      {children}
    </div>
  )
}
