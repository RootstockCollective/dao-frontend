import React from 'react'

interface BuilderMetricCardProps {
  title: string
  children: React.ReactNode
  showClaimButton?: boolean
  onClaimClick?: () => void
}

export const BuilderMetricCard: React.FC<BuilderMetricCardProps> = ({ 
  title, 
  children, 
  showClaimButton = false, 
  onClaimClick 
}) => {
  return (
    <div style={{ 
      display: 'flex',
      paddingBottom: '2px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
      alignSelf: 'stretch',
      flex: 1,
      minWidth: 0,
      padding: '24px',
      background: '#181818',
      borderRadius: '8px',
    }}>
      <span style={{ color: '#aaa', fontSize: '14px' }}>{title}</span>
      <div style={{ flex: 1, width: '100%' }}>
        {children}
      </div>
      {showClaimButton && (
        <button 
          style={{ 
            width: '100%',
            marginTop: 'auto',
            padding: '8px 16px',
            border: '1px solid #fff',
            borderRadius: '4px',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onClick={onClaimClick}
        >
          Claim Rewards
        </button>
      )}
    </div>
  )
} 