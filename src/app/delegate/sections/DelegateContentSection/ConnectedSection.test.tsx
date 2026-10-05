import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initialContextState } from '@/app/delegate/lib/constants'
import type { DelegateContextState } from '@/app/delegate/lib/types'

import { ConnectedSection } from './ConnectedSection'

const ACCOUNT = '0x00000000000000000000000000000000000000Ab'
const DELEGATEE = '0x00000000000000000000000000000000000000cd'

const mocks = vi.hoisted(() => ({
  context: {} as DelegateContextState,
  onDelegate: vi.fn(),
  executeTxFlow: vi.fn(),
}))

vi.mock('wagmi', () => ({ useAccount: () => ({ address: ACCOUNT }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({ balances: {}, isBalancesLoading: false }),
}))
vi.mock('@/app/delegate/contexts/DelegateContext', () => ({ useDelegateContext: () => mocks.context }))
vi.mock('@/shared/hooks/useDelegateToAddress', () => ({
  useDelegateToAddress: () => ({ onDelegate: mocks.onDelegate }),
}))
vi.mock('@/shared/notification/executeTxFlow', () => ({ executeTxFlow: mocks.executeTxFlow }))
vi.mock('@/app/delegate/sections/DelegateContentSection/DelegationDetailsSection', () => ({
  DelegationDetailsSection: () => null,
}))
vi.mock('@/app/delegate/sections/DelegateContentSection/DelegatesContainer', () => ({
  DelegatesContainer: ({
    hasOtherDelegatee,
    onDelegate,
  }: {
    hasOtherDelegatee: boolean
    onDelegate: (address: string) => void
  }) => (
    <div data-testid="DelegatesList" data-has-other-delegatee={String(hasOtherDelegatee)}>
      <button onClick={() => onDelegate(DELEGATEE)}>pick delegate</button>
    </div>
  ),
}))

const setContext = (state: Partial<DelegateContextState>) => {
  mocks.context = { ...initialContextState, ...state }
}

const isListShown = () => !screen.getByTestId('DelegatesContainer').className.includes('max-h-0')

const STRIF_20 = parseEther('20')

const banner = () =>
  screen.queryByTestId('NoVotingPowerSection')
    ? 'no voting power'
    : screen.queryByTestId('NotDelegatedSection')
      ? 'not delegated'
      : 'none'

describe('ConnectedSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(cleanup)

  describe('banner and delegates list for each kind of account', () => {
    it.each([
      // Never delegated
      { status: 'none', own: 0n, votes: 0n, expected: 'no voting power', list: false },
      { status: 'none', own: 0n, votes: STRIF_20, expected: 'none', list: false },
      { status: 'none', own: STRIF_20, votes: 0n, expected: 'not delegated', list: true },
      // Delegated to itself, e.g. after staking
      { status: 'self', own: 0n, votes: 0n, expected: 'no voting power', list: false },
      { status: 'self', own: 0n, votes: STRIF_20, expected: 'none', list: false },
      { status: 'self', own: STRIF_20, votes: STRIF_20, expected: 'none', list: true },
      // Delegated to someone else: the delegate card, with the list behind "Update delegate"
      { status: 'other', own: STRIF_20, votes: 0n, expected: 'none', list: false },
      { status: 'other', own: 0n, votes: 0n, expected: 'none', list: false },
    ] as const)(
      'status $status, own $own, votes $votes: $expected banner, list open: $list',
      ({ status, own, votes, expected, list }) => {
        setContext({ delegationStatus: status, ownStRif: own, availableVotes: votes })

        render(<ConnectedSection />)

        expect(banner()).toBe(expected)
        expect(isListShown()).toBe(list)
      },
    )

    it('tells a stRIF holder that never delegated to pick a first delegate, not to replace one', () => {
      setContext({ delegationStatus: 'none', ownStRif: STRIF_20 })

      render(<ConnectedSection />)

      expect(screen.getByTestId('DelegatesList')).toHaveAttribute('data-has-other-delegatee', 'false')
    })

    it('shows no banner while the account is still being read', () => {
      setContext({
        delegationStatus: 'none',
        cards: { ...initialContextState.cards, own: { isLoading: true } },
      })

      render(<ConnectedSection />)

      expect(banner()).toBe('none')
    })

    it('shows neither a banner nor the list while the delegatee is still loading', () => {
      setContext({ delegationStatus: undefined })

      render(<ConnectedSection />)

      expect(banner()).toBe('none')
      expect(isListShown()).toBe(false)
    })
  })

  describe('delegating to myself from the banner', () => {
    it('delegates the voting power to the account itself', () => {
      setContext({ delegationStatus: 'none', ownStRif: STRIF_20 })
      render(<ConnectedSection />)

      fireEvent.click(screen.getByTestId('NotDelegatedButton'))

      expect(mocks.executeTxFlow).toHaveBeenCalledWith(expect.objectContaining({ action: 'delegation' }))
      mocks.executeTxFlow.mock.calls[0][0].onRequestTx()
      expect(mocks.onDelegate).toHaveBeenCalledWith(ACCOUNT)
    })

    it('keeps the tx pending until the new delegate has been read, so it cannot be sent twice', async () => {
      let finishRefetch = () => {}
      const refetch = vi.fn(() => new Promise<void>(resolve => (finishRefetch = resolve)))
      setContext({ delegationStatus: 'none', ownStRif: STRIF_20, refetch })
      render(<ConnectedSection />)
      fireEvent.click(screen.getByTestId('NotDelegatedButton'))

      let isSuccessDone = false
      const success = mocks.executeTxFlow.mock.calls[0][0].onSuccess().then(() => (isSuccessDone = true))
      await Promise.resolve()

      // executeTxFlow only calls onComplete, which re-enables the button, after onSuccess settles
      expect(refetch).toHaveBeenCalled()
      expect(isSuccessDone).toBe(false)

      finishRefetch()
      await success
      expect(isSuccessDone).toBe(true)
    })
  })

  describe('picking a delegate', () => {
    it('keeps the banner while a delegate is picked, and asks to confirm it in the modal', () => {
      setContext({ delegationStatus: 'none', ownStRif: STRIF_20, nextDelegatee: { address: DELEGATEE } })
      render(<ConnectedSection />)

      fireEvent.click(screen.getByText('pick delegate'))

      expect(screen.getByTestId('NotDelegatedSection')).toBeInTheDocument()
      expect(screen.getByTestId('delegateModal')).toHaveTextContent(
        'You are about to delegate your own voting power of 20 to',
      )
    })

    it('tells an account without stRIF that the delegate will get the stRIF it stakes', () => {
      // An account delegated to someone else that unstaked everything can still update its delegate
      setContext({ delegationStatus: 'other', ownStRif: 0n, nextDelegatee: { address: DELEGATEE } })
      render(<ConnectedSection />)

      fireEvent.click(screen.getByText('pick delegate'))

      expect(screen.getByTestId('delegateModal')).toHaveTextContent(
        'You have no stRIF yet. The stRIF you stake will be delegated to',
      )
      expect(screen.getByTestId('delegateModal')).not.toHaveTextContent('voting power of 0')
    })

    it('says "<1" rather than 0 when delegating less than 1 stRIF', () => {
      setContext({
        delegationStatus: 'none',
        ownStRif: parseEther('0.3'),
        nextDelegatee: { address: DELEGATEE },
      })
      render(<ConnectedSection />)

      fireEvent.click(screen.getByText('pick delegate'))

      expect(screen.getByTestId('delegateModal')).toHaveTextContent('your own voting power of <1 to')
    })

    it('does not show the banner as delegating while a delegation to someone else is confirmed', () => {
      setContext({ delegationStatus: 'none', ownStRif: STRIF_20, nextDelegatee: { address: DELEGATEE } })
      render(<ConnectedSection />)
      fireEvent.click(screen.getByText('pick delegate'))

      // The wallet is now open for the delegation to DELEGATEE
      fireEvent.click(screen.getByRole('button', { name: 'Delegate' }))

      expect(mocks.executeTxFlow).toHaveBeenCalled()
      expect(screen.getByTestId('NotDelegatedButton')).toHaveTextContent('Delegate to myself')
      expect(screen.getByTestId('NotDelegatedButton')).not.toBeDisabled()
    })

    it('hides the banner once the delegation to the picked delegate is pending', () => {
      setContext({
        delegationStatus: 'none',
        ownStRif: STRIF_20,
        isDelegationPending: true,
        displayedDelegatee: { address: DELEGATEE },
      })

      render(<ConnectedSection />)

      expect(banner()).toBe('none')
    })
  })
})
