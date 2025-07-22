import { Button } from '@/components/ButtonNew'
import React from 'react'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <Button variant="secondary-outline" onClick={onClick} disabled={disabled} className="font-rootstock-sans">
      Claim Rewards
    </Button>
  )
}
