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
      className={`adjust-backers-rewards-button ${className}`}
      style={{
        display: 'flex',
        height: '28px',
        padding: '4px 0px',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '4px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-v3-text-100)',
      }}
    >
      <EditIcon size={24} fill="white" style={{ flexShrink: 0 }} />
      <Span variant="body">
        Need to adjust your backers&apos; rewards?
      </Span>
    </button>
  )
}
