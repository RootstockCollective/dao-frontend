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
        'px-4 min-h-21 flex items-center transition-transform duration-300 ease-in-out z-modal bg-l-black',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className,
      )}
    >
      <Hamburger
        className="flex-1"
        isOpen={isSidebarOpen}
        onClick={toggleSidebar}
        ariaLabel={isSidebarOpen ? 'Close menu' : 'Open menu'}
      />

      <NetworkLogo compact={!isSidebarOpen} />

      <UserConnectionManager className="flex-1 flex justify-end" showContent={!isSidebarOpen} />
    </header>
  )
}
