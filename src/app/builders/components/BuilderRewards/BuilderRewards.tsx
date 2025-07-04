import React from 'react'

interface BuilderRewardsProps {
  className?: string
}

export const BuilderRewards: React.FC<BuilderRewardsProps> = ({ className = '' }) => {
  return (
    <div className={`builder-rewards ${className}`}>
      <h3>Builder Rewards</h3>
      <p>Builder rewards component - implementation pending</p>
    </div>
  )
}
