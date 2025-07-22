import React, { ReactNode } from 'react'
import { HistoryIcon } from '@/components/Icons'
import { Span } from '@/components/TypographyNew'

interface SeeRewardsHistoryButtonProps {
  onClick: () => void
  icon?: ReactNode
}

// TODO: not used yet
export const SeeRewardsHistoryButton: React.FC<SeeRewardsHistoryButtonProps> = ({ onClick, icon }) => {
  return (
    <button
      className="flex h-12 py-1 px-0 items-center gap-2 rounded border-none bg-transparent cursor-pointer mt-2"
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {icon || <HistoryIcon size={20} color="var(--color-v3-text-100)" />}
        <Span variant="tag-s" className="text-[var(--color-text-100)]">
          See rewards History
        </Span>
      </div>
    </button>
  )
}
