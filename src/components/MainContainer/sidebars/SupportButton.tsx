'use client'

import { HTMLAttributes } from 'react'

import { KotoQuestionMarkIcon } from '@/components/Icons'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'

import { SupportModal } from './SupportModal'

interface SupportButtonProps extends HTMLAttributes<HTMLDivElement> {
  labelClassName?: string
}

export const SupportButton = ({ className, labelClassName, ...props }: SupportButtonProps) => {
  const { isModalOpened, openModal, closeModal } = useModal()

  return (
    <div className={className} {...props}>
      <button
        type="button"
        onClick={openModal}
        className="flex w-full items-center gap-2 py-3 cursor-pointer text-warm-gray hover:text-text-100"
        data-testid="SidebarSupportButton"
      >
        <KotoQuestionMarkIcon size={16} />
        <Span variant="tag" className={cn('text-warm-gray', labelClassName)}>
          Support
        </Span>
      </button>
      {isModalOpened && <SupportModal onClose={closeModal} />}
    </div>
  )
}
