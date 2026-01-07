import type { ComponentProps, HTMLAttributes } from 'react'
import { CommunityItem } from '../CommunityItem'
import { cn } from '@/lib/utils'

/**
 * Higher Order Component: decides either to show landscape or portrait Community card layout.
 * Uses CSS classes to show/hide the appropriate version based on the component width.
 * This approach works with static pages since it doesn't use any client-side hooks.
 */
export const ResponsiveCommunityItemHOC = ({
  className,
  ...props
}: ComponentProps<typeof CommunityItem> & { className?: HTMLAttributes<'div'>['className'] }) => {
  return (
    <div className={cn('@container', className)}>
      {/* If the component is narrower than 512px always display portrait
      layout regardless of the screen size */}
      <div className="block @lg:hidden h-full">
        <CommunityItem {...props} variant="portrait" />
      </div>
      <div className="hidden @lg:block h-full">
        <CommunityItem {...props} />
      </div>
    </div>
  )
}
