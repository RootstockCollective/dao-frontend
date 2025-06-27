'use client'

import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from '../Icons'

interface Props {
  children: ReactNode
  onClose: () => void
  className?: string
  width?: number
  height?: number | 'auto'
  closeButtonColor?: 'white' | 'black'
  'data-testid'?: string
}

export const Modal: FC<Props> = ({
  children,
  onClose,
  className,
  width,
  height = 'auto',
  closeButtonColor = 'white',
  'data-testid': dataTestId,
}) => {
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center align-center z-50"
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bg-100/50 backdrop-blur-xs"></div>

      {/* Modal Container */}
      <div
        style={{
          width: width ? `${width}px` : undefined,
          height: height !== 'auto' ? `${height}px` : undefined,
        }}
        className={cn(
          'relative',
          width ? 'w-full' : 'w-[380px] md:w-[600px]', // Default responsive width
          height === 'auto'
            ? 'h-full md:h-auto' // Auto on desktop, full on mobile when no height specified
            : 'h-full', // Full height when specific height provided
          'md:max-w-[97vw]',
          'bg-bg-80',
          'rounded-[4px]',
          'overflow-hidden',
          className,
        )}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10" data-testid="CloseButton">
          <CloseIcon size={24} aria-label="Close" color={closeButtonColor} />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}

export type ModalProps = Props
