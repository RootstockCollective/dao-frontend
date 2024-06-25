import { MouseEvent } from 'react'

export interface SidebarButtonsProps {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  activeButton?: 'communities' | 'treasury' | 'proposals' | 'user'
}

export interface LeftSidebarProps {
  activeButton?: SidebarButtonsProps['activeButton']
  onSidebarButtonClick?: (e: MouseEvent<HTMLButtonElement>) => void
}
