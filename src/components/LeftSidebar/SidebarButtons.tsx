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
      text='Communities'
      onClick={onClick}
      fullWidth
      centerContent={false}
      className='mb-[32px]'
      buttonProps={{ id: 'Button_Communities', name: 'communities' }}
      variant={activeButton === 'communities' ? 'primary' : 'transparent'}
    />
    <Button
      startIcon={<GrLineChart />}
      text='Treasury'
      onClick={onClick}
      fullWidth
      variant={activeButton === 'treasury' ? 'primary' : 'transparent'}
      centerContent={false}
      className='mb-[32px]'
      buttonProps={{ id: 'Button_Treasury', name: 'treasury' }}
    />
    <Button
      startIcon={<RiContactsBookLine />}
      text='Proposals'
      onClick={onClick}
      fullWidth
      variant={activeButton === 'proposals' ? 'primary' : 'transparent'}
      centerContent={false}
      className='mb-[32px]'
      buttonProps={{ id: 'Button_Proposals', name: 'proposals' }}
    />
    <Button
      startIcon={<MdPersonOutline />}
      text='User'
      onClick={onClick}
      fullWidth
      variant={activeButton === 'user' ? 'primary' : 'transparent'}
      centerContent={false}
      className='mb-[32px]'
      buttonProps={{ id: 'Button_User', name: 'user' }}
    />
  </div>
)
