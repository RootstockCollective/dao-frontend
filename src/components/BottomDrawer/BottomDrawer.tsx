import { FC } from 'react'
import { createPortal } from 'react-dom'
import { motion, type Variants, AnimatePresence } from 'motion/react'
import { CommonComponentProps } from '@/components/commonProps'

const TRANSITION = {
  duration: 0.3,
  ease: 'circOut',
}

const VARIANTS: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: '0%', opacity: 1 },
  exit: { y: '100%', opacity: 0 },
}

interface BottomActionBarBaseProps extends CommonComponentProps {
  isOpen: boolean
  portalContainer?: HTMLElement | null
  leftOffset?: number
}

export const BottomDrawer: FC<BottomActionBarBaseProps> = ({
  children,
  className = '',
  isOpen,
  portalContainer,
  leftOffset = 0,
  style,
}) => {
  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 z-30 overflow-hidden">
      <motion.div
        className={className}
        style={style}
        animate={{
          paddingLeft: `${leftOffset}px`,
        }}
        transition={TRANSITION}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={TRANSITION}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    portalContainer || document.body,
  )
}
