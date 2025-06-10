import { HTMLAttributes } from 'react'
import Link from 'next/link'
import { RootstockLogoIcon } from '@/components/Icons'
// import { StarIcon, SunIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { Hamburger } from '@/components/Hamburger'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { TemporaryConnect } from './TemporaryConnect'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useLayoutContext()
  return (
    <header {...props} className={cn('px-4 min-h-21 flex items-center', className)}>
      <div className="flex-1/3">
        <Tooltip text={isSidebarOpen ? 'Close menu' : 'Open menu'}>
          <Hamburger isOpen={isSidebarOpen} onClick={toggleSidebar} />
        </Tooltip>
      </div>
      <div className="flex-1/3 flex items-center justify-center">
        <Link href="/" onClick={closeSidebar}>
          <RootstockLogoIcon />
        </Link>
      </div>
      <div className="flex-1/3 flex gap-3 justify-end">
        {/* Favourites star  */}
        {/* <Tooltip text="Add to favourites">
          <StarIcon />
        </Tooltip> */}

        {/* Theme switch */}
        {/* <Tooltip text="White theme">
          <SunIcon />
        </Tooltip> */}
        <TemporaryConnect />
      </div>
    </header>
  )
}
