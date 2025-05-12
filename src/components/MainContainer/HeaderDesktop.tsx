import { HTMLAttributes } from 'react'
import { StarIcon, BellIcon, SunIcon } from './icons'
import { UserConnectionManager } from '@/shared/walletConnection'
import { cn } from '@/lib/utils'
import { SideBarClosedIcon, SideBarOpenedIcon } from './icons'
import { useLayoutContext } from '@/app/providers/LayoutProvider'

export function HeaderDesktop({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <header {...props} className={cn('pt-6 px-7', className)}>
      <div className="flex flex-row justify-between">
        {/* Left side */}
        <div className="flex flex-row items-center">
          <button onClick={toggleSidebar} className="cursor-pointer">
            {isSidebarOpen ? <SideBarOpenedIcon /> : <SideBarClosedIcon />}
          </button>
          <StarIcon className="ml-3" />
          <p className="ml-6 text-sm font-extralight">
            <span className="text-warm-gray">Category /</span> Selected navigation item
          </p>
        </div>
        {/* Right side */}
        <div className="flex flex-row">
          <SunIcon className="mr-3" />
          <BellIcon className="mr-5" />
          <UserConnectionManager />
        </div>
      </div>
    </header>
  )
}
