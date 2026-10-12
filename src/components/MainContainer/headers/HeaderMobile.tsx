import { type HTMLAttributes, useRef } from 'react'

import { Hamburger } from '@/components/Hamburger'
import { NetworkLogo } from '@/components/NetworkLogo'
import { cn } from '@/lib/utils'
import { useStickyHeader } from '@/shared/hooks'
import { useInertHandoff } from '@/shared/hooks/useInertHandoff'
import { UserConnectionManager } from '@/shared/walletConnection'

import { useLayoutContext } from '../LayoutProvider'
import { useTopBarDock } from '../TopBarDockProvider'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { isActive: hasDock, isDocked, slot, setSlot } = useTopBarDock()
  const connectRef = useRef<HTMLDivElement>(null)
  const isConnectInert = useInertHandoff(isDocked, connectRef, () => slot?.querySelector('button'))
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

        <UserConnectionManager
          className={cn(
            'flex-1 flex justify-end transition-opacity duration-240 ease-out-cubic',
            isDocked && 'pointer-events-none opacity-0',
          )}
          ref={connectRef}
          inert={isConnectInert}
          showContent={!isSidebarOpen}
        />
      </div>
      <div ref={setSlot} className="absolute inset-x-0 top-full bg-l-black px-4" />
    </header>
  )
}
