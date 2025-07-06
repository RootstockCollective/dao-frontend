import React from 'react'

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
        border: '1px solid var(--Background-0, #ACA39D)',
        background: 'transparent',
        color: 'var(--Text-100, #FFF)',
        fontFamily: '"Rootstock-Sans"',
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: '150%',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      Claim Rewards
    </button>
  )
}
