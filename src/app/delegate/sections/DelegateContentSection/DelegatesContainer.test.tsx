import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DelegatesContainer } from './DelegatesContainer'

const mocks = vi.hoisted(() => ({
  nftHolders: [] as object[],
  totalDelegatedVotes: undefined as bigint | undefined,
}))

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
  render(
    <DelegatesContainer
      hasOtherDelegatee={props.hasOtherDelegatee ?? false}
      isClosable={props.isClosable ?? false}
      onDelegate={vi.fn()}
      onCloseClick={onCloseClick}
    />,
  )
  return { onCloseClick }
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
