import React from 'react'

import { Button } from '@/components/Button'
import { useSecurityNotice } from '@/components/SecurityNoticeModal'
import { useFeatureFlags } from '@/shared/context/FeatureFlag'

interface ClaimRewardsButtonProps {
  onClick: () => void
  disabled?: boolean
}

export const ClaimRewardsButton = ({ onClick, disabled = false }: ClaimRewardsButtonProps) => {
  const { flags } = useFeatureFlags()
  const { showSecurityNotice } = useSecurityNotice()

  // While the security incident flag is on, rewards distribution is paused, so
  // clicking "Claim Rewards" surfaces the security notice instead of starting
  // the claim flow. Turn the `security_notice` flag off to restore claiming.
  const handleClick = flags.security_notice ? showSecurityNotice : onClick

  return (
    <Button
      variant="secondary-outline"
      onClick={handleClick}
      disabled={disabled}
      className="font-rootstock-sans w-auto"
      textClassName="font-normal text-sm sm:text-base sm:font-bold whitespace-nowrap"
    >
      Claim Rewards
    </Button>
  )
}
