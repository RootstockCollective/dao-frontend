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
  const containerStyle: React.CSSProperties = {}

  if (!fullscreen && width) {
    containerStyle.width = `${width}px`
    containerStyle.maxWidth = '95vw'
  }

  if (!fullscreen && height !== 'auto' && typeof height === 'number') {
    containerStyle.height = `${height}px`
  }

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center z-500 max-w-screen max-h-screen overflow-hidden',
        fullscreen ? '' : 'p-4',
      )}
      data-testid={dataTestId}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-bg-100/50 backdrop-blur-xs max-w-screen max-h-screen overflow-hidden" />

      {/* Modal Container */}
      <div
        className={cn(
          'relative overflow-x-hidden bg-bg-80 rounded overflow-y-auto min-w-0',
          fullscreen ? 'w-screen h-screen' : 'w-[95vw] max-w-[380px] md:w-[688px] md:max-w-[97vw]',
          height === 'auto' && !fullscreen ? 'h-full md:h-auto' : '',
          className,
        )}
        style={containerStyle}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-20" data-testid="CloseButton">
          <CloseIconKoto size={24} aria-label="Close" color={closeButtonColor} />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}
