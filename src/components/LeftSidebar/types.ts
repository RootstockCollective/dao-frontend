export type SidebarButtonType = 'communities' | 'treasury' | 'proposals' | 'user'

export interface SidebarButtonsProps {
  activeButton?: SidebarButtonType
  onClick?: (activeButton: SidebarButtonType) => void
}

export interface LeftSidebarProps {
  activeButton?: SidebarButtonType
  onSidebarButtonClick?: (activeButton: SidebarButtonType) => void
}
