'use client'

import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'
import { useStakeRifAction } from '@/shared/hooks/useStakeRifAction'

interface Props {
  hasStRif: boolean
  isActivating: boolean
  onActivate: () => void
}

/**
 * Takes the place of the delegate card for an account that has never delegated. Its stRIF carries
 * no votes until it is delegated, so a holder activates it by delegating to themselves, and anyone
 * without stRIF has to stake first.
 */
export const NotDelegatedSection = ({ hasStRif, isActivating, onActivate }: Props) => {
  const { action: stakeAction, isLoading: isStakeActionLoading } = useStakeRifAction()

  // Without stRIF the action depends on the RIF balance: wait for it rather than offer the wrong one
  if (!hasStRif && isStakeActionLoading) return null

  const { subtitle, action } = hasStRif
    ? {
        subtitle:
          'Your stRIF only counts in governance once it is delegated. Activate it to vote yourself, or choose a delegate below.',
        action: {
          text: isActivating ? 'Activating...' : 'Activate voting power',
          onClick: onActivate,
        },
      }
    : {
        subtitle: 'Stake RIF to get voting power, then vote yourself or choose a delegate below.',
        action: stakeAction,
      }

  return (
    <EmptyState
      icon={<UsersIcon size={88} color="#37322F" strokeWidth={1.25} aria-hidden="true" />}
      title="You haven't delegated your voting power yet."
      subtitle={subtitle}
      action={
        action && (
          <Button
            variant="primary"
            onClick={action.onClick}
            disabled={isActivating}
            data-testid="NotDelegatedButton"
          >
            {action.text}
          </Button>
        )
      }
      data-testid="NotDelegatedSection"
    />
  )
}
