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
  displayStatus: 'open_to_claim',
  displayStatusLabel: 'Open to claim',
  fiatAmountFormatted: '$98,500',
  claimTokenType: 'rbtc',
  updatedAtFormatted: '15 Jan 2025',
  stateHistory: [
    { date: '10 Jan 2025', displayStatus: 'pending', displayStatusLabel: 'Pending', actionLabel: 'Cancel request' },
  ],
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
    expect(row.data.status).toBe('open_to_claim')
    expect(row.data.displayStatusLabel).toBe('Open to claim')
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
      displayStatus: 'claim_pending',
      displayStatusLabel: 'Claim pending',
      fiatAmountFormatted: null,
      claimTokenType: 'shares',
    }

    const [row] = convertDataToRowData([withdrawalRow])

    expect(row.data.type).toBe('Withdrawal')
    expect(row.data.fiatAmount).toBeNull()
    expect(row.data.claimTokenType).toBe('shares')
    expect(row.data.requestType).toBe('withdrawal')
  })

  it('maps stateHistory to row data', () => {
    const rowWithHistory: RequestHistoryRowDisplay = {
      ...MOCK_ROW,
      stateHistory: [
        { date: '10 Jan 2025', displayStatus: 'pending', displayStatusLabel: 'Pending', actionLabel: 'Cancel request' },
        { date: '12 Jan 2025', displayStatus: 'open_to_claim', displayStatusLabel: 'Open to claim', actionLabel: 'Claimed shares' },
      ],
    }
    const [row] = convertDataToRowData([rowWithHistory])
    expect(row.data.stateHistory).toHaveLength(2)
    expect(row.data.stateHistory[0]).toEqual({
      date: '10 Jan 2025',
      displayStatus: 'pending',
      displayStatusLabel: 'Pending',
      actionLabel: 'Cancel request',
    })
    expect(row.data.stateHistory[1]).toEqual({
      date: '12 Jan 2025',
      displayStatus: 'open_to_claim',
      displayStatusLabel: 'Open to claim',
      actionLabel: 'Claimed shares',
    })
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
