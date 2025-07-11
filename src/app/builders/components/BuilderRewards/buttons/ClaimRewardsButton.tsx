import React from 'react'
import { Span } from '@/components/TypographyNew'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-3 rounded border border-[var(--color-v3-bg-accent-0)] bg-transparent text-[var(--color-v3-text-100)] ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <Span variant="tag" bold>
        Claim Rewards
      </Span>
    </button>
  )
}
