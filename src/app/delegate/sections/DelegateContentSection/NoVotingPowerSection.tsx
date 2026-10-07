'use client'

import { DelegationBannerIcon } from '@/app/delegate/sections/DelegateContentSection/DelegationBannerIcon'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { useStakeRifAction } from '@/shared/hooks/useStakeRifAction'

export const NoVotingPowerSection = () => {
  const { action, isLoading } = useStakeRifAction()

  if (isLoading) return null

  return (
    <EmptyState
      icon={<DelegationBannerIcon />}
      title="You don't have voting power yet."
      subtitle="Stake RIF to get voting power and take part in governance."
      action={
        action && (
          <Button variant="primary" onClick={action.onClick} data-testid="NoVotingPowerButton">
            {action.text}
          </Button>
        )
      }
      data-testid="NoVotingPowerSection"
    />
  )
}
