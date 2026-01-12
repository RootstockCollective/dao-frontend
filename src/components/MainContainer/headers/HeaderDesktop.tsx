import type { HTMLAttributes } from 'react'
import { SideBarClosedIcon, SideBarOpenedIcon } from '../icons'
import { UserConnectionManager } from '@/shared/walletConnection'
import { cn } from '@/lib/utils'
import { useLayoutContext } from '../LayoutProvider'
import { Tooltip } from '@/components/Tooltip'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <header {...props} className={cn('pt-6 px-7 z-base', className)}>
      <div className="flex flex-row justify-between items-center">
        {/* Left side */}
        <div className="flex flex-row items-center">
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
        <div className="flex flex-row items-center">
          <UserConnectionManager />
        </div>
      </div>
    </header>
  )
}
