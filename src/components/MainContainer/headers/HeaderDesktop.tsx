import { HTMLAttributes } from 'react'
import { /* StarIcon, BellIcon, SunIcon, */ SideBarClosedIcon, SideBarOpenedIcon } from '../icons'
import { UserConnectionManager } from '@/shared/walletConnection'
import { cn } from '@/lib/utils'
import { useLayoutContext } from '../LayoutProvider'
import { Tooltip } from '@/components/Tooltip'
import { Breadcrumbs } from './Breadcrumbs'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <header {...props} className={cn('pt-6 px-7', className)}>
      <div className="flex flex-row justify-between items-center">
        {/* Left side */}
        <div className="flex flex-row items-center">
          <Tooltip text={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
            <button onClick={toggleSidebar} className="cursor-pointer">
              {isSidebarOpen ? <SideBarOpenedIcon /> : <SideBarClosedIcon />}
            </button>
          </Tooltip>

          {/* Favourites star */}
          {/* <Tooltip text="Add to favourites">
            <StarIcon className="ml-3" />
          </Tooltip> */}
          <Breadcrumbs />
        </div>
        {/* Right side */}
        <div className="flex flex-row items-center">
          {/* Theme switch */}
          {/* <Tooltip position="left" text="Light theme">
            <SunIcon className="mr-3" />
          </Tooltip> */}

          {/* Notification indicator */}
          {/* <Tooltip text="Notifications">
            <BellIcon className="mr-5" />
          </Tooltip> */}
          <UserConnectionManager />
        </div>
      </div>
    </header>
  )
}
