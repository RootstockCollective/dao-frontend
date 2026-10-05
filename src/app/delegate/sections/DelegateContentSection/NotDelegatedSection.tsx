'use client'

import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'

interface Props {
  isDelegatingToSelf: boolean
  onDelegateToSelf: () => void
  /** The delegates list is unfolded to pick someone else */
  isChoosingDelegate: boolean
  onToggleDelegates: () => void
}

/**
 * Takes the place of the delegate card for an account that holds stRIF but has never delegated. Its
 * stRIF was sent to it rather than staked (staking self-delegates), so it carries no votes until the
 * account delegates it to itself or to someone else.
 */
export const NotDelegatedSection = ({
  isDelegatingToSelf,
  onDelegateToSelf,
  isChoosingDelegate,
  onToggleDelegates,
}: Props) => (
  <EmptyState
    icon={<UsersIcon size={88} color="#37322F" strokeWidth={1.25} aria-hidden="true" />}
    title="You haven't delegated your voting power yet."
    subtitle="Your stRIF only counts once it's delegated. Delegate it to yourself to vote, or choose someone to vote for you."
    action={
      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
        <Button
          variant="primary"
          onClick={onDelegateToSelf}
          disabled={isDelegatingToSelf}
          data-testid="NotDelegatedButton"
        >
          {isDelegatingToSelf ? 'Delegating...' : 'Delegate to myself'}
        </Button>
        <Button
          variant="secondary-outline"
          onClick={onToggleDelegates}
          disabled={isDelegatingToSelf}
          aria-expanded={isChoosingDelegate}
          data-testid="ChooseDelegateButton"
        >
          {isChoosingDelegate ? 'Hide delegates' : 'Choose a delegate'}
        </Button>
      </div>
    }
    data-testid="NotDelegatedSection"
  />
)
