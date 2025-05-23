import { ReactNode } from 'react'

export type SidebarButtonType = 'communities' | 'treasury' | 'proposals' | '' | 'collective-rewards'

export interface SidebarButtonsProps {
  activeButton?: SidebarButtonType
  onClick?: (activeButton: SidebarButtonType) => void
}

export interface LeftSidebarProps {
  activeButton?: SidebarButtonType
  onSidebarButtonClick?: (activeButton: SidebarButtonType) => void
  ConnectedComponent?: ReactNode
}
