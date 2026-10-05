'use client'

import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'
import { useStakeRifAction } from '@/shared/hooks/useStakeRifAction'

/**
 * Shown to an account with no stRIF of its own and no votes delegated to it: it has nothing to vote
 * or delegate with until it stakes.
 */
export const NoVotingPowerSection = () => {
  const { action, isLoading } = useStakeRifAction()

  // The action depends on the RIF balance: wait for it rather than offer the wrong one
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
