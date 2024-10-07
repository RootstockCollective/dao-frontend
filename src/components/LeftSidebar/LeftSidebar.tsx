import { SidebarButtons } from '@/components/LeftSidebar/SidebarButtons'
import { UsefulLinks } from '@/components/LeftSidebar/UsefulLinks'
import { LeftSidebarProps } from '@/components/LeftSidebar/types'

export const LeftSidebar = ({
  activeButton = 'communities',
  onSidebarButtonClick,
  ConnectedComponent,
}: LeftSidebarProps) => {
  return (
    <aside className="min-h-screen w-[300px] border border-input-bg px-6 border-b-0 flex flex-col justify-between whitespace-nowrap bg-foreground">
      <div className="mt-[42px]">
        <SidebarButtons onClick={onSidebarButtonClick} activeButton={activeButton} />
      </div>
      <div className="mb-4">
        <UsefulLinks />
        {ConnectedComponent && ConnectedComponent}
      </div>
    </aside>
  )
}
