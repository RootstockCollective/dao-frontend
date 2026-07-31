'use client'

import { Headset } from 'lucide-react'
import { motion, type Transition, type Variants } from 'motion/react'
import { HTMLAttributes } from 'react'

import { Tooltip } from '@/components/Tooltip'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'

import { SupportModal } from './SupportModal'

interface SupportButtonProps extends HTMLAttributes<HTMLDivElement> {
  labelClassName?: string
  /** True when the desktop sidebar is collapsed: the icon stays visible, the label fades out */
  isCollapsed?: boolean
  /** Collapse animation from the desktop sidebar; expects `icon` and `text` variants */
  variants?: Variants
  transition?: Transition
}

export const SupportButton = ({
  className,
  labelClassName,
  isCollapsed = false,
  variants,
  transition,
  ...props
}: SupportButtonProps) => {
  const { isModalOpened, openModal, closeModal } = useModal()

  return (
    <div className={className} {...props}>
      <button
        type="button"
        onClick={openModal}
        className="flex w-full items-center gap-2 py-3 cursor-pointer text-warm-gray hover:text-text-100"
        data-testid="SidebarSupportButton"
      >
        <motion.div
          variants={variants}
          initial="icon"
          animate="icon"
          transition={transition}
          // same footprint as the nav icons, so both stay centered when collapsed
          className="shrink-0 flex w-5 justify-center"
        >
          <Tooltip text="Support" disabled={!isCollapsed}>
            <Headset size={16} />
          </Tooltip>
        </motion.div>
        <motion.div
          variants={variants}
          initial="text"
          animate="text"
          transition={transition}
          className={cn({ 'pointer-events-none': isCollapsed })}
        >
          <Span variant="tag" className={labelClassName}>
            Support
          </Span>
        </motion.div>
      </button>
      {isModalOpened && <SupportModal onClose={closeModal} />}
    </div>
  )
}
