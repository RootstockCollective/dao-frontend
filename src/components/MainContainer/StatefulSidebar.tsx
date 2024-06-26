import { usePathname } from 'next/navigation'
import { LeftSidebarProps } from '@/components/LeftSidebar/types'
import { LeftSidebar } from '@/components/LeftSidebar/LeftSidebar'

// @TODO we need to confirm the navigation part because it might have subpaths like /proposals/create
export const StatefulSidebar = () => {
  const pathname = usePathname().substring(1) as LeftSidebarProps['activeButton']
  const onSidebarNavigate = () => {
    console.log(14, 'Navigation clicked')
  }

  return <LeftSidebar onSidebarButtonClick={onSidebarNavigate} activeButton={pathname} />
}
