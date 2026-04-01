import { Button } from '@/components/Button'
import React from 'react'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <Button
      variant="secondary-outline"
      onClick={onClick}
      disabled={disabled}
      className="font-rootstock-sans w-auto"
      textClassName="font-normal text-sm sm:text-base sm:font-bold whitespace-nowrap"
    >
      Claim Rewards
    </Button>
  )
}
