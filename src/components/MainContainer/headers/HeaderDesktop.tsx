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
  const isConnectInert = useInertHandoff(isDocked, connectRef, () => slot?.querySelector('button'))
  return (
    <header
      {...props}
      className={cn('relative px-7', hasDock ? 'sticky top-0 z-sticky bg-l-black' : 'z-base', className)}
    >
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
        {/* Right side */}
        <UserConnectionManager
          className={cn(
            'transition-opacity duration-240 ease-out-cubic',
            isDocked && 'pointer-events-none opacity-0',
          )}
          ref={connectRef}
          inert={isConnectInert}
        />
      </div>
      <div ref={setSlot} className="absolute inset-x-0 top-full bg-l-black px-7" />
    </header>
  )
}
