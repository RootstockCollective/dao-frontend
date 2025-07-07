import React from 'react'
import { EditIcon } from '@/components/Icons'
import { Span } from '@/components/TypographyNew'

interface AdjustBackersRewardsButtonProps {
  onClick?: () => void
  className?: string
}

export const AdjustBackersRewardsButton: React.FC<AdjustBackersRewardsButtonProps> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`adjust-backers-rewards-button flex h-7 py-1 px-0 items-center gap-2 rounded bg-transparent border-none cursor-pointer text-[var(--color-v3-text-100)] ${className}`}
    >
      <EditIcon size={24} fill="var(--color-v3-text-100)" className="flex-shrink-0" />
      <Span variant="body">Need to adjust your backers&apos; rewards?</Span>
    </button>
  )
}
