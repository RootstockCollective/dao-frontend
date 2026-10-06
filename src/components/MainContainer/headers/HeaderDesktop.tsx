import { type HTMLAttributes, useRef } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { useInertHandoff } from '@/shared/hooks/useInertHandoff'
import { UserConnectionManager } from '@/shared/walletConnection'

import { SideBarClosedIcon, SideBarOpenedIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { useTopBarDock } from '../TopBarDockProvider'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { isActive: hasDock, isDocked, slot, setSlot } = useTopBarDock()
  const connectRef = useRef<HTMLDivElement>(null)
  // The docked prompt leads with its own Connect button, which takes the focus over
  const isConnectInert = useInertHandoff(isDocked, connectRef, () => slot?.querySelector('button'))
  return (
    <header
      {...props}
      className={cn('relative px-7', hasDock ? 'sticky top-0 z-sticky bg-l-black' : 'z-base', className)}
    >
      {/* Same 64px row whether or not it sticks, so the bar does not jump when a prompt comes or goes */}
      <div className="flex flex-row justify-between items-center min-h-16">
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
        <UserConnectionManager
          className={cn(
            'transition-opacity duration-240 ease-out-cubic',
            isDocked && 'pointer-events-none opacity-0',
          )}
          ref={connectRef}
          inert={isConnectInert}
        />
      </div>
      {/* Docked prompts hang below the top bar instead of growing it: a sticky header that grew
          would push the page down and undo the scroll position that docked them */}
      <div ref={setSlot} className="absolute inset-x-0 top-full bg-l-black px-7" />
    </header>
  )
}
