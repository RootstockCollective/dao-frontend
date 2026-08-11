import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { type Address, type Hash } from 'viem'
import { afterEach, describe, expect, it } from 'vitest'

import { ProposalCategory } from '@/shared/types'

import type { PendingProposal } from '../hooks/usePendingProposals'
import { PendingProposalMobileRows } from './PendingProposalRows'

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
})
