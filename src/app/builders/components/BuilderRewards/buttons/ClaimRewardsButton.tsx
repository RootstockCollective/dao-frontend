import React from 'react'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      style={{
        width: '100%',
        marginTop: 'auto',
        padding: '8px 16px',
        border: '1px solid #fff',
        borderRadius: '4px',
        background: 'transparent',
        color: '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      Claim Rewards
    </button>
  )
}
