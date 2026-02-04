'use client'

import { cn } from '@/lib/utils'
import { FC, ReactNode, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { CloseIconKoto } from '../Icons'
import { PortalContainerContext } from '../PortalContainerContext'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

export interface ModalProps {
  children: ReactNode
  onClose: () => void
  className?: string
  width?: number
  height?: number | 'auto'
  closeButtonColor?: 'white' | 'black'
  'data-testid'?: string
}

/**
 * Modal component that wraps the content of the modal and provides a close button.
 * On mobile, the modal is fullscreen by default.
 */
export const Modal: FC<ModalProps> = ({
  children,
  onClose,
  className,
  width,
  height = 'auto',
  closeButtonColor = 'white',
  'data-testid': dataTestId,
}) => {
  const portalContainerRef = useRef<HTMLDivElement>(null)
  const containerStyle: React.CSSProperties = {}

  const fullscreen = !useIsDesktop()

  if (!fullscreen && width) {
    containerStyle.width = `${width}px`
    containerStyle.maxWidth = '95vw'
  }

  if (!fullscreen && height !== 'auto' && typeof height === 'number') {
    containerStyle.height = `${height}px`
  }

  return createPortal(
    <div
      ref={portalContainerRef}
      className={cn(
        'fixed inset-0 flex items-center justify-center z-modal max-w-screen max-h-screen overflow-hidden',
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
          'shadow-[0px_0px_40px_0px_rgba(255,255,255,0.10)]',
          fullscreen ? 'w-screen h-screen' : 'w-[95vw] max-w-[380px] md:w-[688px] md:max-w-[97vw]',
          height === 'auto' && !fullscreen ? 'h-full md:h-auto' : '',
          className,
        )}
        style={containerStyle}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-base" data-testid="CloseButton">
          <CloseIconKoto size={24} aria-label="Close" color={closeButtonColor} />
        </button>

        <PortalContainerContext.Provider value={portalContainerRef}>
          {children}
        </PortalContainerContext.Provider>
      </div>
    </div>,
    document.body,
  )
}
