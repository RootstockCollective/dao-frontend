import { Logo } from '@/components/Header/Logo'
import { SidebarButtons } from '@/components/LeftSidebar/SidebarButtons'
import { UsefulLinks } from '@/components/LeftSidebar/UsefulLinks'
import { LeftSidebarProps } from '@/components/LeftSidebar/types'
import { CopyrightInfo } from './CopyrightInfo'

export const LeftSidebar = ({ activeButton = 'communities', onSidebarButtonClick }: LeftSidebarProps) => {
  return (
    <aside className="min-h-screen w-[327px] border border-input-bg px-8 border-b-0 flex flex-col justify-between whitespace-nowrap">
      <div>
        <Logo className="mb-[56px] mt-[47px]" />
        <SidebarButtons onClick={onSidebarButtonClick} activeButton={activeButton} />
      </div>
      <div className="mb-4">
        <UsefulLinks />
        <CopyrightInfo />
      </div>
    </aside>
  )
}
