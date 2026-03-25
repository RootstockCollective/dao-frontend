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

function TableWrapper({ row }: { row: typeof CLAIMABLE_DEPOSIT_ROW | typeof PENDING_ROW | typeof DONE_ROW }) {
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

function TestTable({ row }: { row: typeof CLAIMABLE_DEPOSIT_ROW | typeof PENDING_ROW | typeof DONE_ROW }) {
  return (
    <TableProvider<ColumnId, BtcVaultHistoryCellDataMap>>
      <TableWrapper row={row} />
    </TableProvider>
  )
}

describe('BtcVaultHistoryDataRow', () => {
  it('renders row data (type, date, amount, status)', () => {
    render(<TestTable row={CLAIMABLE_DEPOSIT_ROW} />)

    const row = screen.getByTestId('btc-vault-history-data-row')
    expect(row).toHaveTextContent('Deposit')
    expect(row).toHaveTextContent('15 Jan 2025')
    expect(row).toHaveTextContent('1.5')
    expect(row).toHaveTextContent('Ready to claim')
  })

  it('does not show actions when not hovered', () => {
    render(<TestTable row={CLAIMABLE_DEPOSIT_ROW} />)

    expect(screen.queryByText('Claim shares')).not.toBeInTheDocument()
  })

  it('shows "Claim shares" on hover for claimable deposit', () => {
    render(<TestTable row={CLAIMABLE_DEPOSIT_ROW} />)

    fireEvent.mouseEnter(screen.getByTestId('btc-vault-history-data-row'))

    expect(screen.getByText('Claim shares')).toBeInTheDocument()
  })

  it('shows "Cancel request" on hover for pending row', () => {
    render(<TestTable row={PENDING_ROW} />)

    fireEvent.mouseEnter(screen.getByTestId('btc-vault-history-data-row'))

    expect(screen.getByText('Cancel request')).toBeInTheDocument()
  })

  it('hides actions on mouse leave', () => {
    render(<TestTable row={CLAIMABLE_DEPOSIT_ROW} />)
    const row = screen.getByTestId('btc-vault-history-data-row')

    fireEvent.mouseEnter(row)
    expect(screen.getByText('Claim shares')).toBeInTheDocument()

    fireEvent.mouseLeave(row)
    expect(screen.queryByText('Claim shares')).not.toBeInTheDocument()
  })

  it('does not show actions on hover for completed rows', () => {
    render(<TestTable row={DONE_ROW} />)

    fireEvent.mouseEnter(screen.getByTestId('btc-vault-history-data-row'))

    expect(screen.queryByText('Claim shares')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel request')).not.toBeInTheDocument()
  })
})
