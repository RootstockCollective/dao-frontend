import { describe, it, expect } from 'vitest'

import type { RequestHistoryRowDisplay } from '../../services/ui/types'
import { convertDataToRowData } from './convertDataToRowData'

const MOCK_ROW: RequestHistoryRowDisplay = {
  id: 'req-1',
  type: 'deposit',
  amountFormatted: '1.5',
  status: 'claimable',
  createdAtFormatted: '2025-01-15',
  finalizedAtFormatted: null,
  submitTxShort: '0x1234',
  finalizeTxShort: null,
  submitTxFull: '0x1234567890',
  finalizeTxFull: null,
  displayStatus: 'ready_to_claim',
  displayStatusLabel: 'Ready to claim',
  fiatAmountFormatted: '$98,500',
  claimTokenType: 'rbtc',
  updatedAtFormatted: '15 Jan 2025',
}

describe('convertDataToRowData', () => {
  it('returns empty array for undefined data', () => {
    expect(convertDataToRowData(undefined)).toEqual([])
  })

  it('returns empty array for empty array', () => {
    expect(convertDataToRowData([])).toEqual([])
  })

  it('maps deposit row correctly', () => {
    const [row] = convertDataToRowData([MOCK_ROW])

    expect(row.id).toBe('req-1')
    expect(row.data.type).toBe('Deposit')
    expect(row.data.date).toBe('2025-01-15')
    expect(row.data.amount).toBe('1.5')
    expect(row.data.status).toBe('ready_to_claim')
    expect(row.data.displayStatusLabel).toBe('Ready to claim')
    expect(row.data.fiatAmount).toBe('$98,500')
    expect(row.data.claimTokenType).toBe('rbtc')
    expect(row.data.requestStatus).toBe('claimable')
    expect(row.data.updatedAtFormatted).toBe('15 Jan 2025')
    expect(row.data.requestType).toBe('deposit')
  })

  it('maps withdrawal row correctly', () => {
    const withdrawalRow: RequestHistoryRowDisplay = {
      ...MOCK_ROW,
      id: 'req-2',
      type: 'withdrawal',
      displayStatus: 'ready_to_withdraw',
      displayStatusLabel: 'Ready to withdraw',
      fiatAmountFormatted: null,
      claimTokenType: 'shares',
    }

    const [row] = convertDataToRowData([withdrawalRow])

    expect(row.data.type).toBe('Withdrawal')
    expect(row.data.fiatAmount).toBeNull()
    expect(row.data.claimTokenType).toBe('shares')
    expect(row.data.requestType).toBe('withdrawal')
  })

  it('maps multiple rows preserving order', () => {
    const rows = convertDataToRowData([
      { ...MOCK_ROW, id: 'a' },
      { ...MOCK_ROW, id: 'b' },
      { ...MOCK_ROW, id: 'c' },
    ])

    expect(rows.map(r => r.id)).toEqual(['a', 'b', 'c'])
  })
})
