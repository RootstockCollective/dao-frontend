import { Logo } from '@/components/Header/Logo'
import { SidebarButtons } from '@/components/LeftSidebar/SidebarButtons'
import { UsefulLinks } from '@/components/LeftSidebar/UsefulLinks'
import { LeftSidebarProps } from '@/components/LeftSidebar/types'

export const LeftSidebar = ({ activeButton = 'communities', onSidebarButtonClick }: LeftSidebarProps) => {
  return (
    <div className="min-h-screen w-[327px] border border-input-bg px-[32px]">
      <Logo className="mb-[56px] mt-[47px]" textClassName="text-2xl" />
      {/* Sidebar stateful */}
      <SidebarButtons onClick={onSidebarButtonClick} activeButton={activeButton} />
      {/* Useful Links */}
      <UsefulLinks />
    </div>
  )
}
