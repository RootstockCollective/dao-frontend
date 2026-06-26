import React from 'react'

import { Button } from '@/components/Button'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton = ({ onClick, disabled = false }: ClaimRewardsButtonProps) => {
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
