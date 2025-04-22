import { SidebarButtons } from '@/components/LeftSidebar/SidebarButtons'
import { UsefulLinks } from '@/components/LeftSidebar/UsefulLinks'
import { LeftSidebarProps } from '@/components/LeftSidebar/types'

export const LeftSidebar = ({
  activeButton = 'communities',
  onSidebarButtonClick,
  ConnectedComponent,
}: LeftSidebarProps) => {
  return (
    <aside className="h-screen fixed top-0 left-0 w-[300px] sm:overflow-y-auto sm:max-h-screen border border-input-bg px-6 border-b-0 flex flex-col justify-between whitespace-nowrap bg-foreground z-9">
      <div className="mt-[87px]">
        <SidebarButtons onClick={onSidebarButtonClick} activeButton={activeButton} />
      </div>
      <div className="mb-4">
        <UsefulLinks />
        {ConnectedComponent && ConnectedComponent}
      </div>
    </aside>
  )
}
