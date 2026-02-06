import type { HTMLAttributes } from 'react'
import { NetworkLogo } from '@/components/NetworkLogo'
import { useLayoutContext } from '../LayoutProvider'
import { Hamburger } from '@/components/Hamburger'
import { cn } from '@/lib/utils'
import { UserConnectionManager } from '@/shared/walletConnection'
import { useStickyHeader } from '@/shared/hooks'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { headerRef, isVisible } = useStickyHeader({
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
        'px-4 min-h-21 flex items-center relative transition-transform duration-300 ease-in-out z-modal bg-l-black',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className,
      )}
    >
      <Hamburger
        isOpen={isSidebarOpen}
        onClick={toggleSidebar}
        ariaLabel={isSidebarOpen ? 'Close menu' : 'Open menu'}
      />

      {!isSidebarOpen ? (
        <div className="flex-1 flex justify-end items-center gap-2">
          <NetworkLogo compact />
          <UserConnectionManager />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <NetworkLogo />
        </div>
      )}
    </header>
  )
}
