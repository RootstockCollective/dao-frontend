import { LeftSidebar } from '@/components/LeftSidebar/LeftSidebar'
import { SidebarButtonType } from '@/components/LeftSidebar/types'
import { usePathname, useRouter } from 'next/navigation'

// @TODO we need to confirm the navigation part because it might have subpaths like /proposals/create
export const StatefulSidebar = () => {
  const router = useRouter()
  const pathname = usePathname().substring(1) as SidebarButtonType
  const onSidebarNavigate = (activeButton: SidebarButtonType) => router.push(`/${activeButton}`)

  return <LeftSidebar onSidebarButtonClick={onSidebarNavigate} activeButton={pathname} />
}
