'use client'

import { ReactNode, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import modalBg from './images/modal-bg.svg'
import { cn } from '@/lib/utils'
import { Header, Span } from '../Typography'
import { Button } from '../Button'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import { useScrollLock } from '@/shared/hooks/useScrollLock'

// transition animation duration
const duration = 0.3

interface ConfirmationModalProps {
  /**
   * Modal title displayed at the top
   */
  title: string
  /**
   * Controls whether the modal is visible
   */
  isOpen: boolean
  /**
   * Callback triggered when the modal is closed
   */
  onClose: () => void
  /**
   * Pass the main modal text to the `children` prop
   */
  children?: ReactNode
  /**
   * Called when `I Agree` button is clicked
   */
  onAccept?: () => void
  /**
   * Called when `I Disagree` button is clicked
   */
  onDecline?: () => void
  /**
   * When defined, replaces accept/decline buttons
   */
  buttons?: ReactNode
  /**
   * Test identifier for unit and integration tests
   */
  'data-testid'?: string
}

/**
 * Animated modal component.
 * Can be used for disclaimers, warnings, confirmations, or other modal dialogs.
 *
 * It is recommended to use this component together with the `useModal` hook
 * for better state management and handling open/close logic.
 */
export function ConfirmationModal({
  title,
  children,
  onClose,
  'data-testid': dataTestId,
  buttons,
  onAccept,
  onDecline,
  isOpen = false,
}: ConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useClickOutside([modalRef], onClose)

  // setting scroll lock if the modal is opened
  useScrollLock(isOpen)

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" data-testid={dataTestId}>
          {/* Full screen overlay */}
          <motion.div
            key="modal-overlay"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration }}
            className="fixed inset-0 backdrop-filter backdrop-blur-2xl"
          />
          {/* Modal */}
          <motion.div
            key="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration }}
            role="dialog"
            aria-modal="true"
            ref={modalRef}
            className={cn(
              'relative max-h-[699px] h-full max-w-[1116px] w-full px-12',
              'flex flex-col justify-center gap-9',
              'bg-foreground bg-no-repeat bg-right',
              'rounded-lg overflow-hidden',
            )}
            style={{
              backgroundImage: `url(${modalBg.src})`,
            }}
          >
            {/* Header */}
            {title && (
              <Header variant="e2" caps>
                {title}
              </Header>
            )}
            {/* Main contents */}
            <div className="max-w-[513px]">{children}</div>
            {/* Footer with buttons */}
            {buttons ? (
              <div>{buttons}</div>
            ) : (
              <div className="flex flex-row gap-6">
                <Button
                  onClick={onDecline}
                  variant="secondary-outline"
                  className="bg-foreground"
                  data-testid="Disagree"
                >
                  I Disagree
                </Button>
                <Button onClick={onAccept} variant="primary" data-testid="Agree">
                  <Span className="text-text-100" bold>
                    I Agree
                  </Span>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
