import { describe, it, expect } from 'vitest'

import { WeiPerEther } from '@/lib/constants'

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
      rbtcBalance: 2n * WeiPerEther,
      vaultTokens: 5n * WeiPerEther,
      positionValue: (51n * WeiPerEther) / 10n,
      percentOfVault: 10.2,
      totalDepositedPrincipal: 5n * WeiPerEther,
    })
    expect(result.rbtcBalanceFormatted).toBe('2')
    expect(result.vaultTokensFormatted).toBe('5')
    expect(result.positionValueFormatted).toBe('5.1')
    expect(result.percentOfVaultFormatted).toBe('10.20%')
    expect(result.vaultTokensRaw).toBe(5n * WeiPerEther)
    expect(result.rbtcBalanceRaw).toBe(2n * WeiPerEther)
  })

  it('derives current earnings as positionValue - totalDepositedPrincipal', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 0n,
      vaultTokens: 5n * WeiPerEther,
      positionValue: (51n * WeiPerEther) / 10n,
      percentOfVault: 10.2,
      totalDepositedPrincipal: 5n * WeiPerEther,
    })
    expect(result.currentEarningsFormatted).toBe('0.1')
    expect(result.totalBalanceFormatted).toBe('5.1')
    expect(result.totalBalanceRaw).toBe((51n * WeiPerEther) / 10n)
  })

  it('clamps current earnings to zero when positionValue < principal', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 0n,
      vaultTokens: 4n * WeiPerEther,
      positionValue: 4n * WeiPerEther,
      percentOfVault: 8.0,
      totalDepositedPrincipal: 5n * WeiPerEther,
    })
    expect(result.currentEarningsFormatted).toBe('0')
    expect(result.yieldPercentToDateFormatted).toBe('0.00%')
  })

  it('returns 0% yield when totalDepositedPrincipal is 0', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 0n,
      vaultTokens: 0n,
      positionValue: 0n,
      percentOfVault: 0,
      totalDepositedPrincipal: 0n,
    })
    expect(result.yieldPercentToDateFormatted).toBe('0.00%')
    expect(result.currentEarningsFormatted).toBe('0')
    expect(result.totalDepositedPrincipalFormatted).toBe('0')
    expect(result.totalBalanceFormatted).toBe('0')
  })

  it('computes yield percent with integer math', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 0n,
      vaultTokens: 10n * WeiPerEther,
      positionValue: 11n * WeiPerEther,
      percentOfVault: 50,
      totalDepositedPrincipal: 10n * WeiPerEther,
    })
    expect(result.yieldPercentToDateFormatted).toBe('10.00%')
  })

  it('formats fiat amounts using MOCK_RBTC_USD_PRICE', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 2n * WeiPerEther,
      vaultTokens: 5n * WeiPerEther,
      positionValue: (51n * WeiPerEther) / 10n,
      percentOfVault: 10.2,
      totalDepositedPrincipal: 5n * WeiPerEther,
    })
    expect(result.fiatWalletBalance).toBe('$47,500.00 USD')
    expect(result.fiatPrincipalDeposited).toBe('$118,750.00 USD')
    expect(result.fiatTotalBalance).toBe('$121,125.00 USD')
  })

  it('returns zero fiat for empty position', () => {
    const result = toUserPositionDisplay({
      rbtcBalance: 0n,
      vaultTokens: 0n,
      positionValue: 0n,
      percentOfVault: 0,
      totalDepositedPrincipal: 0n,
    })
    expect(result.fiatWalletBalance).toBe('$0.00 USD')
    expect(result.fiatVaultShares).toBe('$0.00 USD')
    expect(result.fiatPrincipalDeposited).toBe('$0.00 USD')
    expect(result.fiatTotalBalance).toBe('$0.00 USD')
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
