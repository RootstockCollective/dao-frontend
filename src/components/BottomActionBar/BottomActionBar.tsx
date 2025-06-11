import { FC } from 'react'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { closedWidth, openedWidth } from '@/components/MainContainer/sidebars/SidebarDesktop'
import { MAIN_CONTAINER_MAX_WIDTH } from '@/lib/constants'
import { BottomDrawer } from '@/components/BottomDrawer'
import { ActionsContainer } from '@/components/containers'
import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'

interface BottomActionBarProps extends CommonComponentProps {
  isOpen: boolean
  portalContainer?: HTMLElement | null
}

export const BottomActionBar: FC<BottomActionBarProps> = ({
  isOpen,
  children,
  portalContainer,
  className,
}) => {
  const { isSidebarOpen } = useLayoutContext()
  const isDesktop = useIsDesktop()

  // Calculate sidebar width based on state (matching SidebarDesktop values)
  const sidebarWidth = isDesktop ? (isSidebarOpen ? openedWidth : closedWidth) : 0

  return (
    <BottomDrawer
      isOpen={isOpen}
      className="mx-auto"
      style={{ maxWidth: MAIN_CONTAINER_MAX_WIDTH }}
      leftOffset={sidebarWidth}
      portalContainer={portalContainer}
    >
      <ActionsContainer className={cn('gap-0', className)}>{children}</ActionsContainer>
    </BottomDrawer>
  )
}
