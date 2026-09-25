import type { HTMLAttributes } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { UserConnectionManager } from '@/shared/walletConnection'

import { SideBarClosedIcon, SideBarOpenedIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { useTopBarDock } from '../TopBarDockProvider'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { isActive: hasDock, isDocked, setSlot } = useTopBarDock()
  return (
    <header
      {...props}
      className={cn('relative px-7', hasDock ? 'sticky top-0 z-sticky bg-l-black' : 'pt-6 z-base', className)}
    >
      <div className={cn('flex flex-row justify-between items-center', hasDock && 'min-h-16')}>
        {/* Left side */}
        <div className="flex flex-row items-center min-w-0">
          <Tooltip text={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
            <button
              type="button"
              onClick={toggleSidebar}
              className="cursor-pointer"
              data-testid="SidebarToggle"
            >
              {isSidebarOpen ? <SideBarOpenedIcon /> : <SideBarClosedIcon />}
            </button>
          </Tooltip>
          <Breadcrumbs />
        </div>
        {/* Right side. Steps aside while a docked prompt shows its own Connect button */}
        <div
          className={cn(
            'flex flex-row items-center transition-opacity duration-240 ease-[cubic-bezier(0.22,0.61,0.36,1)]',
            isDocked && 'pointer-events-none opacity-0',
          )}
          inert={isDocked}
        >
          <UserConnectionManager />
        </div>
      </div>
      {/* Docked prompts hang below the top bar instead of growing it: a sticky header that grew
          would push the page down and undo the scroll position that docked them */}
      <div ref={setSlot} className="absolute inset-x-0 top-full bg-l-black px-7" />
    </header>
  )
}
