import { HTMLAttributes } from 'react'
import { StarIcon, BellIcon, SunIcon } from './icons'
import { UserConnectionManager } from '@/shared/walletConnection'
import { cn } from '@/lib/utils'
import { SideBarClosedIcon, SideBarOpenedIcon } from './icons'
import { useLayoutContext } from '@/app/providers/LayoutProvider'
import { Tooltip } from '../Tooltip'
import { Breadcrumbs } from './Breadcrumbs'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <header {...props} className={cn('pt-6 px-7', className)}>
      <div className="flex flex-row justify-between">
        {/* Left side */}
        <div className="flex flex-row items-center">
          <Tooltip position="bottom" text={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
            <button onClick={toggleSidebar} className="cursor-pointer">
              {isSidebarOpen ? <SideBarOpenedIcon /> : <SideBarClosedIcon />}
            </button>
          </Tooltip>
          <Tooltip position="bottom" text="Add to favourites">
            <StarIcon className="ml-3" />
          </Tooltip>
          <Breadcrumbs />
        </div>
        {/* Right side */}
        <div className="flex flex-row">
          <Tooltip position="left" text="Light theme">
            <SunIcon className="mr-3" />
          </Tooltip>
          <Tooltip position="bottom" text="Notifications">
            <BellIcon className="mr-5" />
          </Tooltip>
          <UserConnectionManager />
        </div>
      </div>
    </header>
  )
}
