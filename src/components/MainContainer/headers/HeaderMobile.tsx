import { HTMLAttributes } from 'react'
import { RootstockLogoIcon } from '@/components/Icons'
// import { StarIcon, SunIcon } from '../icons'
import { useLayoutContext } from '../LayoutProvider'
import { Hamburger } from '@/components/Hamburger'
import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'
import { UserConnectionManager } from '@/shared/walletConnection'
import { useStickyHeader } from '@/shared/hooks'

export function HeaderMobile({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  const { headerRef, isVisible } = useStickyHeader({
    mode: 'direction-based',
    style: {
      backgroundColor: 'var(--l-black)',
    },
  })

  return (
    <header
      ref={headerRef}
      {...props}
      className={cn(
        'px-4 min-h-21 flex items-center transition-transform duration-300 ease-in-out',
        isVisible ? 'translate-y-0' : '-translate-y-full',
        className,
      )}
    >
      <div className="flex-1/3">
        <Tooltip text={isSidebarOpen ? 'Close menu' : 'Open menu'}>
          <Hamburger isOpen={isSidebarOpen} onClick={toggleSidebar} />
        </Tooltip>
      </div>
      <div className="flex-1/3 flex items-center justify-center">
        <div className="m-6 w-fit">
          <RootstockLogoIcon />
        </div>
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
        {!isSidebarOpen && <UserConnectionManager />}
      </div>
    </header>
  )
}
