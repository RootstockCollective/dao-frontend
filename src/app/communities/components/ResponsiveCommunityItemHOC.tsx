import type { ComponentProps, HTMLAttributes } from 'react'
import { CommunityItem } from '../CommunityItem'

/**
 * Higher Order Component: Renders two CommunityItem instances - one for mobile and one for desktop.
 * Uses CSS classes to show/hide the appropriate version based on screen size.
 * This approach works with static pages since it doesn't use any client-side hooks.
 */
export const ResponsiveCommunityItemHOC = ({
  className,
  ...props
}: ComponentProps<typeof CommunityItem> & { className?: HTMLAttributes<'div'>['className'] }) => {
  return (
    <div className={className}>
      {/* Mobile version - hidden on desktop (lg and up) */}
      <div className="block lg:hidden h-full">
        <CommunityItem {...props} variant="portrait" />
      </div>

      {/* Desktop version - hidden on mobile, shown on desktop (lg and up) */}
      <div className="hidden lg:block h-full">
        <CommunityItem {...props} />
      </div>
    </div>
  )
}
