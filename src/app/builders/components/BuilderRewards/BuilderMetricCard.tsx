import React from 'react'

interface BuilderMetricCardProps {
  children: React.ReactNode
  showButton?: boolean
  button?: React.ReactNode
}

export const BuilderMetricCard: React.FC<BuilderMetricCardProps> = ({
  children,
  showButton = false,
  button,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        paddingBottom: '2px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        alignSelf: 'stretch',
        flex: 1,
        minWidth: 0,
        background: 'var(--Background-80, #25211E)',
        borderRadius: '8px',
      }}
    >
      <div style={{ flex: 1, width: '100%' }}>{children}</div>
      <span>{showButton && button}</span>
    </div>
  )
}
