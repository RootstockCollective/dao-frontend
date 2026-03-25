import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'

import { MobileBtcVaultHistoryCard } from './MobileBtcVaultHistoryCard'

afterEach(() => {
  cleanup()
})

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
    displayStatusLabel: 'Ready to claim' as const,
    requestStatus: 'claimable' as const,
    updatedAtFormatted: '15 Jan 2025',
    createdAtFormatted: '10 Jan 2025',
    finalizedAtFormatted: null,
    requestType: 'deposit' as const,
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
  },
}

const DONE_ROW = {
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
  },
}

describe('MobileBtcVaultHistoryCard', () => {
  it('renders card data (type, date, amount, status)', () => {
    render(<MobileBtcVaultHistoryCard row={CLAIMABLE_DEPOSIT_ROW} />)

    const card = screen.getByTestId('mobile-btc-vault-history-card')
    expect(card).toHaveTextContent('Deposit')
    expect(card).toHaveTextContent('15 Jan 2025')
    expect(card).toHaveTextContent('1.5')
    expect(card).toHaveTextContent('Ready to claim')
  })

  it('always shows "Claim shares" for claimable deposit', () => {
    render(<MobileBtcVaultHistoryCard row={CLAIMABLE_DEPOSIT_ROW} />)

    expect(screen.getByText('Claim shares')).toBeInTheDocument()
  })

  it('always shows "Cancel request" for pending row', () => {
    render(<MobileBtcVaultHistoryCard row={PENDING_ROW} />)

    expect(screen.getByText('Cancel request')).toBeInTheDocument()
  })

  it('does not show actions for completed rows', () => {
    render(<MobileBtcVaultHistoryCard row={DONE_ROW} />)

    expect(screen.queryByText('Claim shares')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel request')).not.toBeInTheDocument()
  })

  it('shows fiat amount for deposits', () => {
    render(<MobileBtcVaultHistoryCard row={CLAIMABLE_DEPOSIT_ROW} />)

    expect(screen.getByText('$98,500')).toBeInTheDocument()
  })
})
