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
      `gap-2 w-full items-stretch 
      flex overflow-x-auto
      max-md:snap-x max-md:snap-proximity
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
