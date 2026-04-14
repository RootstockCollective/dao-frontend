import { AnimatePresence, motion, Transition, type Variants } from 'motion/react'
import { createPortal } from 'react-dom'

import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { MAIN_CONTAINER_MAX_WIDTH } from '../ContainerDesktop'
import { useLayoutContext } from '../LayoutProvider'
import { SIDEBAR_CLOSED_WIDTH, SIDEBAR_OPENED_WIDTH } from '../sidebars/SidebarDesktop'

const TRANSITION: Transition = {
  duration: 0.3,
  ease: 'circOut',
}

const VARIANTS: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: '0%', opacity: 1 },
  exit: { y: '100%', opacity: 0 },
}

interface BottomActionBarBaseProps extends CommonComponentProps {
  portalContainer?: HTMLElement | null
}

export const BottomDrawer = ({ className = '', portalContainer }: BottomActionBarBaseProps) => {
  const { isSidebarOpen, isDrawerOpen, drawerContent, setDrawerRef } = useLayoutContext()
  const isDesktop = useIsDesktop()

  const getSidebarWidth = () => {
    if (!isDesktop) return 0
    return isSidebarOpen ? SIDEBAR_OPENED_WIDTH : SIDEBAR_CLOSED_WIDTH
  }

  const sidebarWidth = getSidebarWidth()

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-sticky">
      <motion.div
        className={cn('mx-auto', className)}
        style={{ maxWidth: MAIN_CONTAINER_MAX_WIDTH }}
        animate={{
          paddingLeft: `${sidebarWidth}px`,
        }}
        transition={TRANSITION}
      >
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              ref={setDrawerRef}
              variants={VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={TRANSITION}
            >
              {drawerContent}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    portalContainer || document.body,
  )
}
