import type { HTMLAttributes } from 'react'
import { RootstockLogoIcon } from '@/components/Icons'
import { useLayoutContext } from '../LayoutProvider'
import { Hamburger } from '@/components/Hamburger'
import { Tooltip } from '@/components/Tooltip'
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
        'px-4 min-h-21 flex items-center relative transition-transform duration-300 ease-in-out z-10',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className,
      )}
    >
      <div className="basis-1/2">
        <Tooltip text={isSidebarOpen ? 'Close menu' : 'Open menu'}>
          <Hamburger isOpen={isSidebarOpen} onClick={toggleSidebar} />
        </Tooltip>
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="p-1 rounded-full">
          <RootstockLogoIcon />
        </div>
      </div>
      <div className="basis-1/2 flex justify-end gap-2">{!isSidebarOpen && <UserConnectionManager />}</div>
    </header>
  )
}
