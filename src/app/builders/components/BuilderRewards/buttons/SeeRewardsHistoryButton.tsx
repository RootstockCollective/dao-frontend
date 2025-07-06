import React from 'react'

interface SeeRewardsHistoryButtonProps {
  onClick: () => void
  icon?: React.ReactNode
}

export const SeeRewardsHistoryButton: React.FC<SeeRewardsHistoryButtonProps> = ({
  onClick,
  icon = (
    <span role="img" aria-label="history">
      🕑
    </span>
  ),
}) => {
  return (
    <button
      style={{
        display: 'flex',
        height: '48px',
        padding: '4px 0px',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '4px',
        border: 'none',
        background: 'transparent',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '13px',
        marginTop: '8px',
      }}
      onClick={onClick}
    >
      {icon}
      See Rewards history
    </button>
  )
}
