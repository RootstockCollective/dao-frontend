import type { HTMLAttributes } from 'react'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'

import { SideBarClosedIcon, SideBarOpenedIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { TopBarConnect, TopBarDockSlot } from '../TopBarDock'
import { useTopBarDock } from '../TopBarDockProvider'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { isActive: hasDock } = useTopBarDock()
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
        <TopBarConnect />
      </div>
      <TopBarDockSlot className="px-7" />
    </header>
  )
}
