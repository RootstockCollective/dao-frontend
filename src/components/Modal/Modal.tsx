'use client'

import { cn } from '@/lib/utils'
import { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CloseIconKoto } from '../Icons'

export interface ModalProps {
  children: ReactNode
  onClose: () => void
  className?: string
  width?: number
  height?: number | 'auto'
  closeButtonColor?: 'white' | 'black'
  /** When true, modal takes full viewport width and height, bypassing width/height constraints */
  fullscreen?: boolean
  'data-testid'?: string
}

export const Modal: FC<ModalProps> = ({
  children,
  onClose,
  className,
  width,
  height = 'auto',
  closeButtonColor = 'white',
  fullscreen,
  'data-testid': dataTestId,
}) => {
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50 max-w-screen max-h-screen overflow-hidden',
        fullscreen ? '' : 'p-4',
      )}
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bg-100/50 backdrop-blur-xs max-w-screen max-h-screen overflow-hidden"></div>

      {/* Modal Container */}
      <div
        style={{
          width: fullscreen ? '100vw' : width ? `${width}px` : undefined,
          height: fullscreen ? '100vh' : height !== 'auto' ? `${height}px` : undefined,
          maxWidth: fullscreen ? '100vw' : '100vw',
          maxHeight: fullscreen ? '100vh' : '100vh',
        }}
        className={cn(
          'relative',
          fullscreen
            ? 'w-screen h-screen' // Fullscreen: use viewport units
            : width
              ? 'w-full max-w-[95vw]'
              : 'w-[95vw] max-w-[380px] md:w-[600px] md:max-w-[97vw]', // Responsive width with proper viewport constraints
          fullscreen
            ? '' // Fullscreen: no height constraints
            : height === 'auto'
              ? 'h-full md:h-auto' // Auto on desktop, full on mobile when no height specified
              : 'h-full', // Full height when specific height provided
          'bg-bg-80 rounded overflow-y-auto min-w-0',
          className,
        )}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10" data-testid="CloseButton">
          <CloseIconKoto size={24} aria-label="Close" color={closeButtonColor} />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}
