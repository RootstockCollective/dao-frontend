'use client'

import { DelegationBannerIcon } from '@/app/delegate/sections/DelegateContentSection/DelegationBannerIcon'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'

interface Props {
  isDelegatingToSelf: boolean
  onDelegateToSelf: () => void
  isChoosingDelegate: boolean
  delegatesListId: string
  onToggleDelegates: () => void
}

export const NotDelegatedSection = ({
  isDelegatingToSelf,
  onDelegateToSelf,
  isChoosingDelegate,
  delegatesListId,
  onToggleDelegates,
}: Props) => (
  <EmptyState
    icon={<DelegationBannerIcon />}
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
          aria-controls={delegatesListId}
          data-testid="ChooseDelegateButton"
        >
          {isChoosingDelegate ? 'Hide delegates' : 'Choose a delegate'}
        </Button>
      </div>
    }
    data-testid="NotDelegatedSection"
  />
)
