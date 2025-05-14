import { HTMLAttributes } from 'react'
import Link from 'next/link'
import { RootstockLogoIcon } from '@/components/Icons'
import { StarIcon, SunIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { Hamburger } from '@/components/Hamburger'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <header
      {...props}
      className={cn('px-4 h-21 border-b border-dark-gray', 'flex flex-row items-center', className)}
    >
      <div className="flex-1/3">
        <Tooltip text={isSidebarOpen ? 'Close menu' : 'Open menu'}>
          <Hamburger isOpen={isSidebarOpen} toggle={toggleSidebar} />
        </Tooltip>
      </div>
      <div className="flex-1/3 flex items-center justify-center">
        <Link href="/">
          <RootstockLogoIcon />
        </Link>
      </div>
      <div className="flex-1/3 flex gap-3 justify-end">
        <Tooltip text="Add to favourites">
          <StarIcon />
        </Tooltip>
        <Tooltip text="White theme">
          <SunIcon />
        </Tooltip>
      </div>
    </header>
  )
}
