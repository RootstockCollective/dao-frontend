import { Button } from '@/components/Button'
import { IoPeople } from 'react-icons/io5'
import { GrLineChart } from 'react-icons/gr'
import { MdPersonOutline } from 'react-icons/md'
import { RiContactsBookLine } from 'react-icons/ri'
import { SidebarButtonsProps } from '@/components/LeftSidebar/types'

export const SidebarButtons = ({ onClick, activeButton = 'communities' }: SidebarButtonsProps) => (
  <div>
    <Button
      startIcon={<IoPeople />}
      onClick={() => onClick?.('communities')}
      fullWidth
      centerContent={false}
      className="mb-[32px]"
      buttonProps={{ id: 'Button_Communities', name: 'communities' }}
      variant={activeButton.startsWith('communities') ? 'primary' : 'transparent'}
    >
      Communities
    </Button>
    <Button
      startIcon={<GrLineChart />}
      onClick={() => onClick?.('treasury')}
      fullWidth
      variant={activeButton.startsWith('treasury') ? 'primary' : 'transparent'}
      centerContent={false}
      className="mb-[32px]"
      buttonProps={{ id: 'Button_Treasury', name: 'treasury' }}
    >
      Treasury
    </Button>
    <Button
      startIcon={<RiContactsBookLine />}
      onClick={() => onClick?.('proposals')}
      fullWidth
      variant={activeButton.startsWith('proposals') ? 'primary' : 'transparent'}
      centerContent={false}
      className="mb-[32px]"
      buttonProps={{ id: 'Button_Proposals', name: 'proposals' }}
    >
      Proposals
    </Button>
    <Button
      startIcon={<MdPersonOutline />}
      onClick={() => onClick?.('user')}
      fullWidth
      variant={activeButton.startsWith('user') ? 'primary' : 'transparent'}
      centerContent={false}
      className="mb-[32px]"
      buttonProps={{ id: 'Button_User', name: 'user' }}
    >
      User
    </Button>
  </div>
)
