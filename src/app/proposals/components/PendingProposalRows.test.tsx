import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen, within } from '@testing-library/react'
import { type Address, type Hash } from 'viem'
import { afterEach, describe, expect, it } from 'vitest'

import { ProposalCategory } from '@/shared/types'

import type { PendingProposal } from '../hooks/usePendingProposals'
import { PendingProposalDesktopRows, PendingProposalMobileRows } from './PendingProposalRows'

const MILESTONE_PROPOSAL: PendingProposal = {
  transactionHash: `0x${'1'.repeat(64)}` as Hash,
  name: 'Fund a builder',
  proposer: '0x0000000000000000000000000000000000000001' as Address,
  category: ProposalCategory.Milestone1,
  stage: 'syncing',
  submittedAt: 1_750_000_000_000,
  expiresAt: 1_750_003_600_000,
  chainId: 31,
  proposalId: '42',
}

describe('PendingProposalMobileRows', () => {
  afterEach(() => cleanup())

  it('renders the selected milestone icon instead of the generic proposal icon', () => {
    render(
      <TooltipProvider>
        <PendingProposalMobileRows pendingProposals={[MILESTONE_PROPOSAL]} />
      </TooltipProvider>,
    )

    expect(screen.getByLabelText(ProposalCategory.Milestone1)).toHaveTextContent('1')
  })

  it.each([
    ['confirming', 'Verifying', 'Waiting for confirmation'],
    ['syncing', 'Almost there', 'Live in a few minutes'],
  ] as const)('renders the %s state copy', (stage, badge, timing) => {
    render(
      <TooltipProvider>
        <PendingProposalMobileRows pendingProposals={[{ ...MILESTONE_PROPOSAL, stage }]} />
      </TooltipProvider>,
    )

    expect(screen.getAllByText(badge).length).toBeGreaterThan(0)
    expect(screen.getByText(timing)).toBeInTheDocument()
  })

  it('uses mobile-safe semantics and hides the decorative spinner from assistive technology', () => {
    render(
      <TooltipProvider>
        <PendingProposalMobileRows pendingProposals={[MILESTONE_PROPOSAL]} />
      </TooltipProvider>,
    )

    expect(screen.getByTestId('PendingProposalRow')).not.toHaveAttribute('role')
    expect(screen.getByLabelText('Proposal loading')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('PendingProposalDesktopRows', () => {
  afterEach(() => cleanup())

  it('keeps the stacked proposal name aligned with the seven data columns', () => {
    const gridTemplateColumns = '1.6fr 1.2fr 1.32fr 1.4fr 1fr 0.62fr 0.8fr'
    render(
      <TooltipProvider>
        <div role="table">
          <div role="rowgroup">
            <PendingProposalDesktopRows
              pendingProposals={[MILESTONE_PROPOSAL]}
              gridTemplateColumns={gridTemplateColumns}
            />
          </div>
        </div>
      </TooltipProvider>,
    )

    const row = screen.getByRole('row')
    const cells = within(row).getAllByRole('cell')
    expect(row).toHaveStyle({ gridTemplateColumns })
    expect(cells).toHaveLength(8)
    expect(cells[0]).toHaveStyle({ gridColumn: '1 / -1' })
  })
})
