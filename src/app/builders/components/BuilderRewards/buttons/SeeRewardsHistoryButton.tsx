import React from 'react'
import { HistoryIcon } from '@/components/Icons'

interface SeeRewardsHistoryButtonProps {
  onClick: () => void
  icon?: React.ReactNode
}

export const SeeRewardsHistoryButton: React.FC<SeeRewardsHistoryButtonProps> = ({ onClick, icon }) => {
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
        cursor: 'pointer',
        marginTop: '8px',
      }}
      onClick={onClick}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {icon || <HistoryIcon size={20} color="var(--Text-100, #FFF)" />}
        <span
          style={{
            color: 'var(--Text-100, #FFF)',
            fontFamily: '"Rootstock-Sans"',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '145%',
          }}
        >
          See rewards History
        </span>
      </div>
    </button>
  )
}
