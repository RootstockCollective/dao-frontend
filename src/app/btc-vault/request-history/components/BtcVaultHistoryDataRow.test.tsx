import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, describe, it, expect } from 'vitest'

import { TableProvider, useTableActionsContext } from '@/shared/context'

import type { BtcVaultHistoryCellDataMap, ColumnId } from './BtcVaultHistoryTable.config'
import { DEFAULT_HEADERS } from './BtcVaultHistoryTable.config'
import { BtcVaultHistoryDataRow } from './BtcVaultHistoryDataRow'

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
      { date: '10 Jan 2025', displayStatus: 'pending' as const, displayStatusLabel: 'Pending' as const, actionLabel: null },
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
      { date: '10 Jan 2025', displayStatus: 'pending' as const, displayStatusLabel: 'Pending' as const, actionLabel: null },
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

function TableWrapper({ row }: { row: (typeof DONE_DEPOSIT_ROW) | (typeof PENDING_ROW) | (typeof CLAIMABLE_DEPOSIT_ROW) }) {
  const dispatch = useTableActionsContext<ColumnId, BtcVaultHistoryCellDataMap>()

  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: DEFAULT_HEADERS })
  }, [dispatch])

  return (
    <table>
      <tbody>
        <BtcVaultHistoryDataRow row={row} />
      </tbody>
    </table>
  )
}

function TestTable({ row }: { row: (typeof DONE_DEPOSIT_ROW) | (typeof PENDING_ROW) | (typeof CLAIMABLE_DEPOSIT_ROW) }) {
  return (
    <TableProvider<ColumnId, BtcVaultHistoryCellDataMap>>
      <TableWrapper row={row} />
    </TableProvider>
  )
}

describe('BtcVaultHistoryDataRow', () => {
  it('does not expand when pending row (empty stateHistory) is clicked', () => {
    render(<TestTable row={PENDING_ROW} />)

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))

    expect(screen.queryAllByTestId('btc-vault-history-detail-row')).toHaveLength(0)
  })

  it('is not clickable when row has no stateHistory', () => {
    render(<TestTable row={PENDING_ROW} />)
    const row = screen.getByTestId('btc-vault-history-data-row')

    expect(row.className).not.toContain('cursor-pointer')
  })

  it('renders detail rows with correct dates and statuses when expanded', () => {
    render(<TestTable row={DONE_DEPOSIT_ROW} />)

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))

    const detailRows = screen.getAllByTestId('btc-vault-history-detail-row')
    expect(detailRows).toHaveLength(2)

    expect(detailRows[0]).toHaveTextContent('10 Jan 2025')
    expect(detailRows[0]).toHaveTextContent('Pending')
    expect(detailRows[1]).toHaveTextContent('12 Jan 2025')
    expect(detailRows[1]).toHaveTextContent('Open to claim')
  })

  it('shows action label in detail rows when present, "-" when null', () => {
    render(<TestTable row={DONE_DEPOSIT_ROW} />)

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))

    const detailRows = screen.getAllByTestId('btc-vault-history-detail-row')
    expect(detailRows[0]).toHaveTextContent('-')
    expect(detailRows[1]).toHaveTextContent('Claimed shares')
  })

  it('collapses detail rows on second click', () => {
    render(<TestTable row={DONE_DEPOSIT_ROW} />)

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))
    expect(screen.getAllByTestId('btc-vault-history-detail-row')).toHaveLength(2)

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))
    expect(screen.queryAllByTestId('btc-vault-history-detail-row')).toHaveLength(0)
  })

  it('hides actions when collapsed and shows them when expanded', () => {
    render(<TestTable row={CLAIMABLE_DEPOSIT_ROW} />)

    expect(screen.queryByText('Claim shares')).toBeNull()

    fireEvent.click(screen.getByTestId('btc-vault-history-data-row'))

    expect(screen.getByText('Claim shares')).toBeTruthy()
  })
})
