'use client'

import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'
import { useStakeRifAction } from '@/shared/hooks/useStakeRifAction'

export const NoVotingPowerSection = () => {
  const { action, isLoading } = useStakeRifAction()

  if (isLoading) return null

  return (
    <EmptyState
      icon={<UsersIcon size={88} color="#37322F" strokeWidth={1.25} aria-hidden="true" />}
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
