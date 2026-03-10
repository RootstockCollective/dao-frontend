import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'

import { MobileBtcVaultHistoryCard } from './MobileBtcVaultHistoryCard'

afterEach(() => {
  cleanup()
})

const DONE_DEPOSIT_ROW = {
  id: 'req-done',
  data: {
    type: 'Deposit' as const,
    date: '15 Jan 2025',
    amount: '1.5',
    actions: '',
    fiatAmount: '$98,500',
    claimTokenType: 'rbtc' as const,
    status: 'successful' as const,
    displayStatusLabel: 'Successful' as const,
    requestStatus: 'done' as const,
    updatedAtFormatted: '15 Jan 2025',
    createdAtFormatted: '10 Jan 2025',
    finalizedAtFormatted: '15 Jan 2025',
    requestType: 'deposit' as const,
    stateHistory: [
      { date: '10 Jan 2025', displayStatus: 'pending' as const, displayStatusLabel: 'Pending' as const, actionLabel: 'Cancel request' },
      { date: '12 Jan 2025', displayStatus: 'open_to_claim' as const, displayStatusLabel: 'Open to claim' as const, actionLabel: 'Claimed shares' },
    ],
  },
}

const CLAIMABLE_DEPOSIT_ROW = {
  id: 'req-claimable',
  data: {
    type: 'Deposit' as const,
    date: '15 Jan 2025',
    amount: '1.5',
    actions: '',
    fiatAmount: '$98,500',
    claimTokenType: 'rbtc' as const,
    status: 'open_to_claim' as const,
    displayStatusLabel: 'Open to claim' as const,
    requestStatus: 'claimable' as const,
    updatedAtFormatted: '15 Jan 2025',
    createdAtFormatted: '10 Jan 2025',
    finalizedAtFormatted: null,
    requestType: 'deposit' as const,
    stateHistory: [
      { date: '10 Jan 2025', displayStatus: 'pending' as const, displayStatusLabel: 'Pending' as const, actionLabel: 'Cancel request' },
    ],
  },
}

const PENDING_ROW = {
  id: 'req-pending',
  data: {
    type: 'Deposit' as const,
    date: '15 Jan 2025',
    amount: '1.5',
    actions: '',
    fiatAmount: '$98,500',
    claimTokenType: 'rbtc' as const,
    status: 'pending' as const,
    displayStatusLabel: 'Pending' as const,
    requestStatus: 'pending' as const,
    updatedAtFormatted: '15 Jan 2025',
    createdAtFormatted: '15 Jan 2025',
    finalizedAtFormatted: null,
    requestType: 'deposit' as const,
    stateHistory: [],
  },
}

describe('MobileBtcVaultHistoryCard', () => {
  it('does not expand when pending card (empty stateHistory) is tapped', () => {
    render(<MobileBtcVaultHistoryCard row={PENDING_ROW} />)

    fireEvent.click(screen.getByTestId('mobile-btc-vault-history-card'))

    expect(screen.queryAllByTestId('mobile-btc-vault-history-detail-entry')).toHaveLength(0)
  })

  it('renders detail entries with correct dates, statuses, and action labels when expanded', () => {
    render(<MobileBtcVaultHistoryCard row={DONE_DEPOSIT_ROW} />)

    fireEvent.click(screen.getByTestId('mobile-btc-vault-history-card'))

    const entries = screen.getAllByTestId('mobile-btc-vault-history-detail-entry')
    expect(entries).toHaveLength(2)

    expect(entries[0]).toHaveTextContent('10 Jan 2025')
    expect(entries[0]).toHaveTextContent('Pending')
    expect(entries[0]).toHaveTextContent('Cancel request')

    expect(entries[1]).toHaveTextContent('12 Jan 2025')
    expect(entries[1]).toHaveTextContent('Open to claim')
    expect(entries[1]).toHaveTextContent('Claimed shares')
  })

  it('collapses detail entries on second tap', () => {
    render(<MobileBtcVaultHistoryCard row={DONE_DEPOSIT_ROW} />)

    fireEvent.click(screen.getByTestId('mobile-btc-vault-history-card'))
    expect(screen.getAllByTestId('mobile-btc-vault-history-detail-entry')).toHaveLength(2)

    fireEvent.click(screen.getByTestId('mobile-btc-vault-history-card'))
    expect(screen.queryAllByTestId('mobile-btc-vault-history-detail-entry')).toHaveLength(0)
  })

  it('hides actions when collapsed and shows them when expanded', () => {
    render(<MobileBtcVaultHistoryCard row={CLAIMABLE_DEPOSIT_ROW} />)

    expect(screen.queryByText('Claim shares')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('mobile-btc-vault-history-card'))

    expect(screen.getByText('Claim shares')).toBeInTheDocument()
  })
})
