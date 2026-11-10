import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DelegatesContainer } from './DelegatesContainer'

const mocks = vi.hoisted(() => ({
  nftHolders: [] as object[],
  totalDelegatedVotes: undefined as bigint | undefined,
}))

const { DENIED, DOMAIN, SLOW, resolveSlow } = vi.hoisted(() => {
  let resolveSlow: (address: string) => void = () => {}
  return {
    DENIED: '0x17296956b4E07Ff8931E4fF4EA06709fAb70B879',
    DOMAIN: 'curia.rsk',
    SLOW: new Promise<string>(resolve => {
      resolveSlow = resolve
    }),
    resolveSlow: (address: string) => resolveSlow(address),
  }
})

vi.mock('@/app/user/Delegation/hooks/useNftHoldersWithVotingPower', () => ({
  useNftHoldersWithVotingPower: () => ({
    nftHolders: mocks.nftHolders,
    totalDelegatedVotes: mocks.totalDelegatedVotes,
    refetch: vi.fn(),
  }),
}))
vi.mock('@/app/backing/components/BuilderHeader/BuilderHeader', () => ({
  BuilderHeader: ({ address }: { address: string }) => <span>{address}</span>,
}))
vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<object>()),
  DELEGATES_DENYLIST: [DENIED.toLowerCase(), DOMAIN],
}))
vi.mock('@/lib/rns', () => ({
  resolveRnsDomain: (domain: string) => {
    if (domain === 'slow.rsk') return SLOW
    return Promise.resolve(domain === 'alias.rsk' ? DENIED : '0x' + '1'.repeat(40))
  },
}))

const DELEGATE = '0x00000000000000000000000000000000000000Ab'
const delegate = (overrides: object = {}) => ({
  address: DELEGATE,
  RNS: null,
  delegatedSince: '1738817290',
  totalVotes: 120,
  delegators: 22,
  votingPower: 1500,
  imageIpfs: null,
  ...overrides,
})

const renderContainer = (props: { hasOtherDelegatee?: boolean; isClosable?: boolean } = {}) => {
  const onCloseClick = vi.fn()
  const onDelegate = vi.fn()
  render(
    <DelegatesContainer
      hasOtherDelegatee={props.hasOtherDelegatee ?? false}
      isClosable={props.isClosable ?? false}
      onDelegate={onDelegate}
      onCloseClick={onCloseClick}
    />,
  )
  return { onCloseClick, onDelegate }
}

describe('DelegatesContainer', () => {
  beforeEach(() => {
    mocks.nftHolders = []
    mocks.totalDelegatedVotes = undefined
  })
  afterEach(cleanup)

  it('measures the voting weight against the delegated voting power, not the token supply', () => {
    mocks.nftHolders = [delegate()]
    mocks.totalDelegatedVotes = parseEther('10000')

    renderContainer()

    const card = screen.getByTestId(`delegateCardContainer-${DELEGATE}`)
    expect(card).toHaveTextContent('Voting power1500')
    expect(card).toHaveTextContent('Voting weight15.00%')
    expect(card).toHaveTextContent('Total votes120')
    expect(card).toHaveTextContent('Delegators22')
  })

  it('lists the delegates before the total delegated voting power is known', () => {
    mocks.nftHolders = [delegate()]

    renderContainer()

    const card = screen.getByTestId(`delegateCardContainer-${DELEGATE}`)
    expect(card).toHaveTextContent('Voting power1500')
    expect(card).toHaveTextContent('Voting weight - Total votes')
  })

  it('keeps listing a vetted delegate that currently holds no voting power', () => {
    mocks.nftHolders = [delegate({ votingPower: 0 })]
    mocks.totalDelegatedVotes = parseEther('10000')

    renderContainer()

    const card = screen.getByTestId(`delegateCardContainer-${DELEGATE}`)
    expect(card).toHaveTextContent('Voting power0')
    expect(card).toHaveTextContent('Voting weight0.00%')
  })

  it('can be closed when it was opened on demand', () => {
    const { onCloseClick } = renderContainer({ isClosable: true })

    fireEvent.click(screen.getByTestId('closeDelegatesContainer'))

    expect(onCloseClick).toHaveBeenCalledTimes(1)
  })

  it('has no close icon when it stays open', () => {
    renderContainer({ isClosable: false })

    expect(screen.queryByTestId('closeDelegatesContainer')).not.toBeInTheDocument()
  })

  it('asks for a first delegate when nobody else holds the voting power', () => {
    renderContainer({ isClosable: true })

    expect(screen.getByText('Input delegate to make governance decisions on your behalf')).toBeInTheDocument()
    expect(screen.getByTestId('delegateButton')).toHaveTextContent('Delegate')
    expect(screen.getByTestId('delegateButton')).not.toHaveTextContent('Update delegate')
  })

  it('asks for a new delegate when the voting power is delegated to someone else', () => {
    renderContainer({ hasOtherDelegatee: true, isClosable: true })

    expect(screen.getByText('Input a new delegate for your voting power')).toBeInTheDocument()
    expect(screen.getByTestId('delegateButton')).toHaveTextContent('Update delegate')
  })
})

describe('DelegatesContainer denylist', () => {
  const typeDelegate = async (value: string) => {
    const { onDelegate } = renderContainer()
    fireEvent.change(screen.getByTestId('delegateInput'), { target: { value } })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    return onDelegate
  }

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('rejects a denied address', async () => {
    const onDelegate = await typeDelegate(DENIED)

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delegateButton'))
    expect(onDelegate).not.toHaveBeenCalled()
  })

  it('rejects a denied RNS domain without resolving it', async () => {
    await typeDelegate(DOMAIN)

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
  })

  it('rejects any other domain that resolves to a denied address', async () => {
    await typeDelegate('alias.rsk')

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
  })

  it('still accepts a domain that resolves elsewhere', async () => {
    await typeDelegate('puddii.rsk')

    expect(screen.getByText(/RNS Valid!/)).toBeInTheDocument()
  })

  it('ignores an RNS lookup that finishes after the input was replaced', async () => {
    const typed = '0x' + '2'.repeat(40)
    const stale = '0x' + '3'.repeat(40)
    const onDelegate = await typeDelegate('slow.rsk')
    expect(screen.getByText('Validating...')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('delegateInput'), { target: { value: typed } })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    resolveSlow(stale)
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(screen.queryByText(/RNS Valid!/)).not.toBeInTheDocument()
    expect(screen.queryByText(new RegExp(stale, 'i'))).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delegateButton'))
    expect(onDelegate).toHaveBeenCalledWith(typed, '')
  })
})
