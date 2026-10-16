import type { HTMLAttributes } from 'react'

import { Hamburger } from '@/components/Hamburger'
import { NetworkLogo } from '@/components/NetworkLogo'
import { cn } from '@/lib/utils'
import { useStickyHeader } from '@/shared/hooks'

import { useLayoutContext } from '../LayoutProvider'
import { TopBarConnect, TopBarDockSlot } from '../TopBarDock'
import { useTopBarDock } from '../TopBarDockProvider'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { isActive: hasDock } = useTopBarDock()
  const { headerRef, isVisible } = useStickyHeader({
    isEnabled: !hasDock,
    mode: 'direction-based',
    style: {
      backgroundColor: 'var(--l-black)',
    },
  })

  return (
    <header
      ref={headerRef}
      {...props}
      className={cn(
        'relative px-4 transition-transform duration-300 ease-in-out z-modal bg-l-black',
        hasDock && 'sticky top-0',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className,
      )}
    >
      <div className="min-h-21 flex items-center">
        <Hamburger
          className="flex-1"
          isOpen={isSidebarOpen}
          onClick={toggleSidebar}
          ariaLabel={isSidebarOpen ? 'Close menu' : 'Open menu'}
        />

        <NetworkLogo compact={!isSidebarOpen} />

        <TopBarConnect className="flex-1 flex justify-end" showContent={!isSidebarOpen} />
      </div>
      <TopBarDockSlot className="px-4" />
    </header>
  )
}
