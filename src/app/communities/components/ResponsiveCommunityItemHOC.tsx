import { CommunityItem } from '../CommunityItem'
import { ComponentProps } from 'react'

/**
 * Higher Order Component: Renders two CommunityItem instances - one for mobile and one for desktop.
 * Uses CSS classes to show/hide the appropriate version based on screen size.
 * This approach works with static pages since it doesn't use any client-side hooks.
 */
export const ResponsiveCommunityItemHOC = (props: ComponentProps<typeof CommunityItem>) => {
  return (
    <>
      {/* Mobile version - hidden on desktop (lg and up) */}
      <div className="block lg:hidden">
        <CommunityItem {...props} variant="portrait" />
      </div>

      {/* Desktop version - hidden on mobile, shown on desktop (lg and up) */}
      <div className="hidden lg:block">
        <CommunityItem {...props} />
      </div>
    </>
  )
}
