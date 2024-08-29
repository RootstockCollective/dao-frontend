import { Button } from '@/components/Button'
import { SidebarButtonsProps } from '@/components/LeftSidebar/types'
import Image from 'next/image'

const ImageAsIcon = ({ src, alt }: { src: string; alt: string }) => (
  <Image src={src} alt={alt} width={20} height={20} />
)

const DEFAULT_BUTTON_CLASSNAME = 'mb-[32px] pl-11'

const START_ICON_CLASSES = 'left-[-28px] top-[2px]'

export const SidebarButtons = ({ onClick, activeButton = 'communities' }: SidebarButtonsProps) => (
  <div>
    <Button
      startIcon={<ImageAsIcon src="/images/sidemenu/communities.svg" alt="Communities" />}
      onClick={() => onClick?.('communities')}
      fullWidth
      centerContent={false}
      className={DEFAULT_BUTTON_CLASSNAME}
      buttonProps={{ id: 'Button_Communities', name: 'communities' }}
      variant={activeButton.startsWith('communities') ? 'primary' : 'transparent'}
      startIconClasses={START_ICON_CLASSES}
    >
      Communities
    </Button>
    <Button
      startIcon={<ImageAsIcon src="/images/sidemenu/treasury.svg" alt="Treasury" />}
      onClick={() => onClick?.('treasury')}
      fullWidth
      variant={activeButton.startsWith('treasury') ? 'primary' : 'transparent'}
      centerContent={false}
      className={DEFAULT_BUTTON_CLASSNAME}
      buttonProps={{ id: 'Button_Treasury', name: 'treasury' }}
      startIconClasses={START_ICON_CLASSES}
    >
      Treasury
    </Button>
    <Button
      startIcon={<ImageAsIcon src="/images/sidemenu/proposals.svg" alt="Proposals" />}
      onClick={() => onClick?.('proposals')}
      fullWidth
      variant={activeButton.startsWith('proposals') ? 'primary' : 'transparent'}
      centerContent={false}
      className={DEFAULT_BUTTON_CLASSNAME}
      buttonProps={{ id: 'Button_Proposals', name: 'proposals' }}
      startIconClasses={START_ICON_CLASSES}
    >
      Proposals
    </Button>
    <Button
      startIcon={<ImageAsIcon src="/images/sidemenu/user.svg" alt="User" />}
      onClick={() => onClick?.('user')}
      fullWidth
      variant={activeButton.startsWith('user') ? 'primary' : 'transparent'}
      centerContent={false}
      className={DEFAULT_BUTTON_CLASSNAME}
      buttonProps={{ id: 'Button_User', name: 'user' }}
      startIconClasses={START_ICON_CLASSES}
    >
      User
    </Button>
    <Button
      startIcon={<ImageAsIcon src="/images/sidemenu/bim.svg" alt="Builders Incentives" />}
      onClick={() => onClick?.('bim')}
      fullWidth
      variant={activeButton.startsWith('bim') ? 'primary' : 'transparent'}
      centerContent={false}
      className={DEFAULT_BUTTON_CLASSNAME}
      buttonProps={{ id: 'Button_Bim', name: 'bim' }}
      startIconClasses={START_ICON_CLASSES}
    >
      Builders Incentives
    </Button>
  </div>
)
