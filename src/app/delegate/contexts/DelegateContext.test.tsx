import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { parseEther, zeroAddress } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ConnectedSection } from '@/app/delegate/sections/DelegateContentSection/ConnectedSection'

import { DelegateContextProvider, useDelegateContext } from './DelegateContext'

const ACCOUNT = '0x00000000000000000000000000000000000000Ab'
const DELEGATEE = '0x00000000000000000000000000000000000000cd'

const mocks = vi.hoisted(() => ({
  reads: {} as Record<string, unknown>,
  loading: new Set<string>(),
  refetchHolders: vi.fn(() => Promise.resolve()),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: ACCOUNT, isConnected: true }),
  useReadContract: (config?: { functionName: string; args?: [string] }) => {
    const key = config && [config.functionName, ...(config.args ?? [])].join(':')
    return {
      data: key && !mocks.loading.has(config.functionName) ? mocks.reads[key] : undefined,
      isLoading: !!config && mocks.loading.has(config.functionName),
      refetch: vi.fn(() => Promise.resolve()),
    }
  },
}))
vi.mock('@/app/user/Delegation/hooks/useNftHoldersWithVotingPower', () => ({
  useNftHoldersWithVotingPower: () => ({ nftHolders: [], refetch: mocks.refetchHolders }),
}))
vi.mock('@/lib/rns', () => ({ getEnsDomainName: () => Promise.resolve(undefined) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({ balances: {}, isBalancesLoading: false }),
}))
vi.mock('@/shared/hooks/useDelegateToAddress', () => ({
  useDelegateToAddress: () => ({ onDelegate: vi.fn() }),
}))
vi.mock('@/shared/notification/executeTxFlow', () => ({ executeTxFlow: vi.fn() }))
vi.mock('@/app/delegate/sections/DelegateContentSection/DelegatesContainer', () => ({
  DelegatesContainer: ({ onDelegate }: { onDelegate: (address: string) => void }) => (
    <button onClick={() => onDelegate('0x00000000000000000000000000000000000000Ef')}>pick delegate</button>
  ),
}))

const Cards = () => {
  const { cards, setIsDelegationPending, refetch } = useDelegateContext()
  return (
    <>
      <span data-testid="DelegatedCard" data-loading={String(!!cards.delegated.isLoading)}>
        {cards.delegated.contentValue}
      </span>
      <span data-testid="AvailableCard" data-loading={String(!!cards.available.isLoading)}>
        {cards.available.contentValue}
      </span>
      <button onClick={() => setIsDelegationPending(true)}>start delegation</button>
      <button onClick={() => setIsDelegationPending(false)}>finish delegation</button>
      <button onClick={() => refetch()}>refetch</button>
    </>
  )
}

const renderPage = () =>
  render(
    <DelegateContextProvider>
      <Cards />
      <ConnectedSection />
    </DelegateContextProvider>,
  )

describe('DelegateContextProvider on the delegation page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.refetchHolders.mockImplementation(() => Promise.resolve())
    mocks.loading.clear()
    mocks.reads = {
      [`balanceOf:${ACCOUNT}`]: parseEther('20'),
      [`getVotes:${ACCOUNT}`]: 0n,
      totalSupply: parseEther('1000'),
    }
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('never shows the zero address as the delegate of an account that never delegated', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = zeroAddress

    renderPage()

    expect(await screen.findByTestId('NotDelegatedSection')).toHaveTextContent('Delegate to myself')
    expect(screen.queryByTestId(`delegateCardContainer-${zeroAddress}`)).not.toBeInTheDocument()
    expect(screen.queryByText(/You have chosen/)).not.toBeInTheDocument()
    expect(screen.getByTestId('DelegatedCard')).toHaveTextContent('0')
    expect(screen.getByTestId('AvailableCard')).toHaveTextContent('0')
  })

  it('waits for the stRIF balance before offering an action', () => {
    mocks.reads[`delegates:${ACCOUNT}`] = zeroAddress
    mocks.loading.add('balanceOf')

    renderPage()

    expect(screen.queryByTestId('NotDelegatedSection')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NoVotingPowerSection')).not.toBeInTheDocument()
  })

  it('does not tell an account that others delegated to that it has no voting power', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = zeroAddress
    mocks.reads[`balanceOf:${ACCOUNT}`] = 0n
    mocks.reads[`getVotes:${ACCOUNT}`] = parseEther('500000')

    renderPage()

    expect(await screen.findByTestId('AvailableCard')).toHaveTextContent('500000')
    expect(screen.queryByTestId('NoVotingPowerSection')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotDelegatedSection')).not.toBeInTheDocument()
  })

  it('tells a self-delegated account that unstaked everything that it has no voting power', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = ACCOUNT
    mocks.reads[`balanceOf:${ACCOUNT}`] = 0n

    renderPage()

    expect(await screen.findByTestId('NoVotingPowerSection')).toHaveTextContent(
      "You don't have voting power yet.",
    )
  })

  it('still shows the delegate card of an account delegated to someone else', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = DELEGATEE

    renderPage()

    expect(await screen.findByTestId(`delegateCardContainer-${DELEGATEE}`)).toHaveTextContent('Reclaim')
    expect(screen.getByTestId('ParagraphDelegateeAddress')).toHaveTextContent('You have chosen')
    expect(screen.queryByTestId('NotDelegatedSection')).not.toBeInTheDocument()
    expect(screen.getByTestId('DelegatedCard')).toHaveTextContent('20')
  })

  it('stops loading the cards when the new delegate is read before the delegation tx flow completes', () => {
    mocks.reads[`delegates:${ACCOUNT}`] = ACCOUNT
    mocks.reads[`getVotes:${ACCOUNT}`] = parseEther('20')
    const { rerender } = renderPage()

    fireEvent.click(screen.getByText('start delegation'))
    expect(screen.getByTestId('DelegatedCard')).toHaveAttribute('data-loading', 'true')

    mocks.reads[`delegates:${ACCOUNT}`] = DELEGATEE
    mocks.reads[`getVotes:${ACCOUNT}`] = 0n
    rerender(
      <DelegateContextProvider>
        <Cards />
        <ConnectedSection />
      </DelegateContextProvider>,
    )
    fireEvent.click(screen.getByText('finish delegation'))

    expect(screen.getByTestId('DelegatedCard')).toHaveAttribute('data-loading', 'false')
    expect(screen.getByTestId('AvailableCard')).toHaveAttribute('data-loading', 'false')
    expect(screen.getByTestId('DelegatedCard')).toHaveTextContent('20')
  })

  it('shows the cards loading while an account that never delegated delegates to itself', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = zeroAddress
    renderPage()
    await screen.findByTestId('NotDelegatedSection')

    fireEvent.click(screen.getByText('start delegation'))

    expect(screen.getByTestId('DelegatedCard')).toHaveAttribute('data-loading', 'true')
    expect(screen.getByTestId('AvailableCard')).toHaveAttribute('data-loading', 'true')
  })

  it('keeps the current delegate on screen while another one is picked, until it is confirmed', async () => {
    mocks.reads[`delegates:${ACCOUNT}`] = DELEGATEE
    renderPage()
    await screen.findByTestId(`delegateCardContainer-${DELEGATEE}`)

    fireEvent.click(screen.getByText('pick delegate'))

    expect(screen.getByTestId(`delegateCardContainer-${DELEGATEE}`)).toBeInTheDocument()
    expect(screen.getByTestId('delegateModal')).toBeInTheDocument()
  })

  it('shows the delegated and available cards loading until the first read lands', () => {
    mocks.reads[`delegates:${ACCOUNT}`] = ACCOUNT
    mocks.loading.add('getVotes')
    const { rerender } = renderPage()

    expect(screen.getByTestId('DelegatedCard')).toHaveAttribute('data-loading', 'true')
    expect(screen.getByTestId('AvailableCard')).toHaveAttribute('data-loading', 'true')

    mocks.loading.clear()
    rerender(
      <DelegateContextProvider>
        <Cards />
        <ConnectedSection />
      </DelegateContextProvider>,
    )

    expect(screen.getByTestId('DelegatedCard')).toHaveAttribute('data-loading', 'false')
    expect(screen.getByTestId('AvailableCard')).toHaveAttribute('data-loading', 'false')
  })

  it('does not let a failing delegates list break the refetch after a tx', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.refetchHolders.mockImplementation(() => Promise.reject(new Error('Failed to fetch contributors')))
    mocks.reads[`delegates:${ACCOUNT}`] = ACCOUNT
    renderPage()

    fireEvent.click(screen.getByText('refetch'))

    await vi.waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('Failed to refresh the delegates list', expect.any(Error)),
    )
  })
})
