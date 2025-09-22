import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { BackMoreBuildersCard } from '../BuilderCard'

interface SpotlightBuildersGridProps extends CommonComponentProps {
  showBackMoreBuildersCard?: boolean
}

export const SpotlightBuildersGrid = ({
  showBackMoreBuildersCard,
  children,
  className,
}: SpotlightBuildersGridProps) => (
  <div
    className={cn(
      `grid grid-cols-4 gap-2 w-full items-stretch 
      max-sm:flex max-sm:overflow-x-auto max-sm:gap-4 
      max-sm:snap-x max-sm:snap-proximity
      scrollbar-none px-4`,
      className,
    )}
  >
    {children}
    {showBackMoreBuildersCard && (
      <div className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
        <BackMoreBuildersCard />
      </div>
    )}
  </div>
)
