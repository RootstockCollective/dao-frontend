import { BackMoreBuildersCard, BuilderCardControl, BuilderCardControlProps } from '../BuilderCard'

interface SpotlightBuildersGridProps {
  builders: BuilderCardControlProps[]
  showBackMoreBuildersCard?: boolean
}

export const SpotlightBuildersGrid = ({ builders, showBackMoreBuildersCard }: SpotlightBuildersGridProps) => (
  <div
    className="grid grid-cols-4 gap-2 w-full items-stretch 
      max-sm:flex max-sm:overflow-x-auto max-sm:gap-4 
      max-sm:[-webkit-overflow-scrolling:auto]
      max-sm:snap-x max-sm:snap-proximity
      scrollbar-none px-4"
  >
    {builders.map(({ builder, ...props }, index) => (
      <div key={builder.address} className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
        <BuilderCardControl builder={builder} index={index} {...props} />
      </div>
    ))}
    {showBackMoreBuildersCard && (
      <div className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
        <BackMoreBuildersCard />
      </div>
    )}
  </div>
)
