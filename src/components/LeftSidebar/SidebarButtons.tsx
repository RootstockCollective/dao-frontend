import { Button } from '@/components/Button'
import { SidebarButtonsProps } from '@/components/LeftSidebar/types'

const DEFAULT_BUTTON_CLASSNAME = 'mb-[32px] pl-11 md:mb-[15px]'

const START_ICON_CLASSES = 'left-[-28px] top-[2px]'

interface SidebarButtonProps {
  text: string
  isActive: boolean
  onClick?: () => void
  buttonProps: {
    id: string
    name: string
  }
}
const SidebarButton = ({ text, onClick, isActive, buttonProps }: SidebarButtonProps) => (
  <Button
    fullWidth
    centerContent={false}
    startIconClasses={START_ICON_CLASSES}
    onClick={onClick}
    className={DEFAULT_BUTTON_CLASSNAME}
    variant={isActive ? 'sidebar-active' : 'borderless'}
    buttonProps={buttonProps}
  >
    {text}
  </Button>
)
export const SidebarButtons = ({ onClick, activeButton = 'communities' }: SidebarButtonsProps) => (
  <>
    <SidebarButton
      onClick={() => onClick?.('user')}
      isActive={!activeButton || activeButton.startsWith('user')}
      buttonProps={{ id: 'Button_User', name: 'user' }}
      text="My Collective"
    />
    <SidebarButton
      onClick={() => onClick?.('treasury')}
      isActive={activeButton.startsWith('treasury')}
      buttonProps={{ id: 'Button_Treasury', name: 'treasury' }}
      text="Treasury"
    />
    <SidebarButton
      onClick={() => onClick?.('proposals')}
      isActive={activeButton.startsWith('proposals')}
      buttonProps={{ id: 'Button_Proposals', name: 'proposals' }}
      text="Proposals"
    />
    <SidebarButton
      onClick={() => onClick?.('communities')}
      isActive={activeButton.startsWith('communities')}
      buttonProps={{ id: 'Button_Communities', name: 'communities' }}
      text="Communities"
    />
    <SidebarButton
      onClick={() => onClick?.('collective-rewards')}
      isActive={activeButton.startsWith('collective-rewards')}
      buttonProps={{ id: 'Button_CollectiveRewards', name: 'collective-rewards' }}
      text="Collective Rewards"
    />
  </>
)
