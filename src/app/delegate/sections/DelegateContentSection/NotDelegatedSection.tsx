'use client'

import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'

interface Props {
  isDelegatingToSelf: boolean
  onDelegateToSelf: () => void
  isChoosingDelegate: boolean
  onToggleDelegates: () => void
}

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
