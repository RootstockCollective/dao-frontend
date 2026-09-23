import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ProposalsContext } from '@/app/proposals/context'
import { ProposalCounts } from '@/app/proposals/shared/types'

import { ProposalsBanner } from './ProposalsBanner'

const mockUseAccount = vi.fn(() => ({ isConnected: true }))

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../CreateProposalFlow', () => ({
  CreateProposalFlow: () => <button type="button">Create a proposal</button>,
}))

vi.mock('@/shared/walletConnection/connection/ConnectWorkflow', () => ({
  ConnectWorkflow: () => <button type="button">Connect Wallet</button>,
}))

const renderBanner = (contextOverrides = {}, fallbackCounts: ProposalCounts | null = null) =>
  render(
    <ProposalsContext.Provider
      value={{
        proposals: [],
        loading: false,
        error: null,
        activeProposalCount: '4',
        totalProposalCount: '910',
        ...contextOverrides,
      }}
    >
      <ProposalsBanner fallbackCounts={fallbackCounts} />
    </ProposalsContext.Provider>,
  )

describe('ProposalsBanner', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ isConnected: true })
  })

  afterEach(cleanup)

  it('renders the copy, the counters and the Discourse link', () => {
    renderBanner()

    expect(screen.getByText('Proposals')).toBeInTheDocument()
    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('4')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('910')
    expect(screen.getByTestId('DiscourseLink')).toBeInTheDocument()
    expect(screen.getByText('Create a proposal')).toBeInTheDocument()
  })

  it('gates the active counter behind the wallet connection', () => {
    mockUseAccount.mockReturnValue({ isConnected: false })

    renderBanner()

    expect(screen.queryByTestId('ActiveProposalsCount')).not.toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('910')
  })

  it('falls back to a placeholder while the proposals are loading', () => {
    renderBanner({ loading: true })

    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('-')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('-')
  })

  it('shows the on-chain counters when The Graph failed', () => {
    renderBanner({ error: new Error('graph down') }, { total: 912, active: 3 })

    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('3')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('912')
  })

  it('keeps the active placeholder until the on-chain states arrive', () => {
    renderBanner({ error: new Error('graph down') }, { total: 912, active: null })

    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('-')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('912')
  })

  it('shows placeholders when The Graph failed and the chain has not answered yet', () => {
    renderBanner({ error: new Error('graph down') })

    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('-')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('-')
  })

  it('prefers The Graph counters over the chain ones while The Graph works', () => {
    renderBanner({}, { total: 1, active: 1 })

    expect(screen.getByTestId('ActiveProposalsCount')).toHaveTextContent('4')
    expect(screen.getByTestId('TotalProposalsCount')).toHaveTextContent('910')
  })

  it('hides the banner when dismissed, without persisting the choice', () => {
    renderBanner()

    fireEvent.click(screen.getByTestId('DismissBannerButton'))

    expect(screen.queryByTestId('ProposalsBanner')).not.toBeInTheDocument()
    expect(Object.keys(localStorage)).toHaveLength(0)
  })
})
