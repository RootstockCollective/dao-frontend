import React from 'react'
import { Span } from '@/components/TypographyNew'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      style={{
        display: 'flex',
        padding: '12px 16px',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '4px',
        border: '1px solid var(--color-v3-bg-accent-0)',
        background: 'transparent',
        color: 'var(--color-v3-text-100)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      <Span variant="tag" bold>
        Claim Rewards
      </Span>
    </button>
  )
}
