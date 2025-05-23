'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: ReactNode
  onClose: () => void
  className?: string
  variant?: 'desktop' | 'mobile'
  'data-testid'?: string
}

export const Modal: FC<Props> = ({
  children,
  onClose,
  className,
  variant = 'desktop',
  'data-testid': dataTestId,
}) => {
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center z-50" data-testid={dataTestId}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px]"></div>

      {/* Modal Container */}
      {/* Desktop Modal - Hidden on mobile */}
      <div
        className={cn(
          'hidden md:block relative bg-[#1C1C1C] rounded-[4px] overflow-hidden',
          'shadow-lg border border-[#2D2D2D]',
          className,
        )}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10" data-testid="CloseButton">
          <Image src="/images/close-button.svg" width={24} height={24} alt="Close" />
        </button>

        {children}
      </div>

      {/* Mobile Modal - Hidden on desktop */}
      <div
        className={cn(
          'block md:hidden relative w-[380px] max-w-[90vw] bg-[#1C1C1C] rounded-[4px] overflow-hidden',
          'shadow-lg border border-[#2D2D2D]',
          className,
        )}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10" data-testid="CloseButton">
          <Image src="/images/close-button.svg" width={24} height={24} alt="Close" />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  )
}

export type ModalProps = Props
