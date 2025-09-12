import { Builder } from '@/app/collective-rewards/types'
import { FC } from 'react'
import { BackMoreBuildersCard, BuilderCardControl } from '../BuilderCard'

interface SpotlightBuildersGridProps {
  builders: Builder[]
  isInteractive?: boolean
  showBackMoreBuildersCard?: boolean
}

export const SpotlightBuildersGrid = ({
  builders,
  isInteractive = false,
  showBackMoreBuildersCard,
}: SpotlightBuildersGridProps) => (
  <div
    className="grid grid-cols-4 gap-2 w-full items-stretch 
      max-sm:flex max-sm:overflow-x-auto max-sm:gap-4 
      max-sm:[-webkit-overflow-scrolling:auto]
      max-sm:snap-x max-sm:snap-proximity
      scrollbar-none"
  >
    {builders.map((builder, index) => (
      <div key={builder.address} className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
        <BuilderCardControl builder={builder} isInteractive={isInteractive} index={index} />
      </div>
    ))}
    {showBackMoreBuildersCard && (
      <div className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
        <BackMoreBuildersCard />
      </div>
    )}
  </div>
)
