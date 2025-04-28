'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: ReactNode
  onClose: () => void
  className?: string
  width?: number
  'data-testid'?: string
}
export const Modal: FC<Props> = ({ children, onClose, width, className, 'data-testid': dataTestId }) => {
  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-50 rounded-[8px]"
      data-testid={dataTestId}
    >
      <div
        className="fixed inset-0 backdrop-filter backdrop-blur-2xl transition-opacity"
        onClick={onClose}
      ></div>
      <div
        className={cn(
          'relative max-w-xl bg-background rounded-lg shadow-xl overflow-hidden transform transition-all border border-[#2D2D2D] z-10',
          className,
        )}
        style={{ minWidth: width }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-[24px] rounded-full p-2"
          data-testid="CloseButton"
        >
          <Image src="/images/close-button.svg" width={24} height={24} alt="Close" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export type ModalProps = Props
