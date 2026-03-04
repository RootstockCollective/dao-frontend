import { describe, it, expect } from 'vitest'
import {
  toVaultMetricsDisplay,
  toUserPositionDisplay,
  toActionEligibility,
  toActiveRequestDisplay,
  toPaginatedHistoryDisplay,
} from './mappers'

describe('toVaultMetricsDisplay', () => {
  it('formats raw metrics', () => {
    const result = toVaultMetricsDisplay({
      tvl: 50_000_000_000_000_000_000n,
      apy: 85_000_000n,
      nav: 1_020_000_000_000_000_000n,
      timestamp: 1700000000,
    })
    expect(result.tvlFormatted).toBe('50')
    expect(result.apyFormatted).toBe('8.50')
    expect(result.navFormatted).toBe('1.02')
    expect(result.timestamp).toBe(1700000000)
  })
})

describe('toUserPositionDisplay', () => {
  it('includes formatted strings and raw bigints', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 2_000_000_000_000_000_000n,
      vaultTokens: 5_000_000_000_000_000_000n,
      positionValue: 5_100_000_000_000_000_000n,
      percentOfVault: 10.2,
    })
    expect(result.rbtcBalanceFormatted).toBe('2')
    expect(result.vaultTokensFormatted).toBe('5')
    expect(result.positionValueFormatted).toBe('5.1')
    expect(result.percentOfVaultFormatted).toBe('10.20%')
    expect(result.vaultTokensRaw).toBe(5_000_000_000_000_000_000n)
    expect(result.rbtcBalanceRaw).toBe(2_000_000_000_000_000_000n)
  })
})

describe('toActionEligibility', () => {
  const activePause = { deposits: 'active' as const, withdrawals: 'active' as const }
  const eligible = { eligible: true, reason: '' }
  const noActiveRequests: [] = []

  it('happy path — all allowed', () => {
    const result = toActionEligibility(activePause, eligible, noActiveRequests)
    expect(result.canDeposit).toBe(true)
    expect(result.canWithdraw).toBe(true)
    expect(result.depositBlockReason).toBe('')
    expect(result.withdrawBlockReason).toBe('')
  })

  it('deposits paused', () => {
    const result = toActionEligibility(
      { deposits: 'paused', withdrawals: 'active' },
      eligible,
      noActiveRequests,
    )
    expect(result.canDeposit).toBe(false)
    expect(result.depositBlockReason).toBe('Deposits are currently paused')
    expect(result.canWithdraw).toBe(true)
  })

  it('withdrawals paused', () => {
    const result = toActionEligibility(
      { deposits: 'active', withdrawals: 'paused' },
      eligible,
      noActiveRequests,
    )
    expect(result.canDeposit).toBe(true)
    expect(result.canWithdraw).toBe(false)
    expect(result.withdrawBlockReason).toBe('Withdrawals are currently paused')
  })

  it('ineligible user', () => {
    const result = toActionEligibility(
      activePause,
      { eligible: false, reason: 'KYC required' },
      noActiveRequests,
    )
    expect(result.canDeposit).toBe(false)
    expect(result.depositBlockReason).toBe('KYC required')
  })

  it('has active request', () => {
    const activeReq = [
      {
        id: 'req-1',
        type: 'deposit' as const,
        amount: 1n,
        status: 'pending' as const,
        epochId: '1',
        batchRedeemId: null,
        timestamps: { created: 1700000000 },
        txHashes: {},
      },
    ]
    const result = toActionEligibility(activePause, eligible, activeReq)
    expect(result.canDeposit).toBe(false)
    expect(result.depositBlockReason).toBe('You already have an active request')
    expect(result.canWithdraw).toBe(false)
    expect(result.withdrawBlockReason).toBe('You already have an active request')
  })

  it('AC-6: in-flight requests are unaffected by pause — pause does not alter active request state', () => {
    const activeReq = [
      {
        id: 'req-1',
        type: 'deposit' as const,
        amount: 1_000_000_000_000_000_000n,
        status: 'pending' as const,
        epochId: '1',
        batchRedeemId: null,
        timestamps: { created: 1700000000 },
        txHashes: { submit: '0xabc' },
      },
    ]
    const fullyPaused = { deposits: 'paused' as const, withdrawals: 'paused' as const }

    const result = toActionEligibility(fullyPaused, eligible, activeReq)

    expect(result.canDeposit).toBe(false)
    expect(result.canWithdraw).toBe(false)

    expect(activeReq).toHaveLength(1)
    expect(activeReq[0].status).toBe('pending')
    expect(activeReq[0].amount).toBe(1_000_000_000_000_000_000n)
    expect(activeReq[0].id).toBe('req-1')
  })
})

describe('toActiveRequestDisplay', () => {
  it('maps request without claimable info', () => {
    const req = {
      id: 'req-1',
      type: 'deposit' as const,
      amount: 500_000_000_000_000_000n,
      status: 'pending' as const,
      epochId: '1',
      batchRedeemId: null,
      timestamps: { created: 1700000000 },
      txHashes: { submit: '0xabc' },
    }
    const result = toActiveRequestDisplay(req, null)
    expect(result.claimable).toBe(false)
    expect(result.lockedSharePriceFormatted).toBeNull()
    expect(result.finalizeId).toBe('1')
    expect(result.amountFormatted).toBe('0.5')
  })

  it('maps request with claimable info', () => {
    const req = {
      id: 'req-2',
      type: 'withdrawal' as const,
      amount: 1_000_000_000_000_000_000n,
      status: 'claimable' as const,
      epochId: null,
      batchRedeemId: 'batch-1',
      timestamps: { created: 1700000000 },
      txHashes: { submit: '0xdef' },
    }
    const claimable = { claimable: true, lockedSharePrice: 1_020_000_000_000_000_000n }
    const result = toActiveRequestDisplay(req, claimable)
    expect(result.claimable).toBe(true)
    expect(result.lockedSharePriceFormatted).toBe('1.02/share')
    expect(result.finalizeId).toBe('batch-1')
  })
})

describe('toPaginatedHistoryDisplay', () => {
  it('formats paginated results with tx hashes', () => {
    const raw = {
      data: [
        {
          id: 'req-1',
          type: 'deposit' as const,
          amount: 1_000_000_000_000_000_000n,
          status: 'done' as const,
          epochId: '1',
          batchRedeemId: null,
          timestamps: { created: 1700000000, finalized: 1700003600 },
          txHashes: { submit: '0x' + 'a'.repeat(64), finalize: '0x' + 'b'.repeat(64) },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
    const result = toPaginatedHistoryDisplay(raw)
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].submitTxShort).toBe('0xaaaa...aaaa')
    expect(result.rows[0].submitTxFull).toBe('0x' + 'a'.repeat(64))
    expect(result.rows[0].finalizedAtFormatted).not.toBeNull()
    expect(result.total).toBe(1)
    expect(result.totalPages).toBe(1)
  })

  it('handles missing tx hashes and finalized timestamp', () => {
    const raw = {
      data: [
        {
          id: 'req-2',
          type: 'deposit' as const,
          amount: 0n,
          status: 'pending' as const,
          epochId: '1',
          batchRedeemId: null,
          timestamps: { created: 1700000000 },
          txHashes: {},
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
    const result = toPaginatedHistoryDisplay(raw)
    expect(result.rows[0].submitTxShort).toBeNull()
    expect(result.rows[0].finalizeTxShort).toBeNull()
    expect(result.rows[0].finalizedAtFormatted).toBeNull()
  })
})
