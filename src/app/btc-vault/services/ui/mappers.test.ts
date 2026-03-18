import { describe, it, expect } from 'vitest'

import { WeiPerEther } from '@/lib/constants'

import {
  toVaultMetricsDisplay,
  toEpochDisplay,
  toUserPositionDisplay,
  toActionEligibility,
  toActiveRequestDisplay,
  toRequestDetailDisplay,
  toPaginatedHistoryDisplay,
  apiHistoryToPaginatedDisplay,
  toCapitalAllocationDisplay,
  mapRequestDisplayStatus,
  toWalletBalanceDisplay,
} from './mappers'

describe('toEpochDisplay', () => {
  it('maps epoch state and includes endTime and closesAtFormatted', () => {
    const endTime = 1740182400 // 23 Feb 2025 00:00:00 UTC
    const result = toEpochDisplay({
      epochId: '1',
      status: 'open',
      startTime: endTime - 86400,
      endTime,
      settledAt: null,
      navPerShare: null,
      totalDepositAssets: 0n,
      totalRedemptionShares: 0n,
    })
    expect(result.epochId).toBe('1')
    expect(result.status).toBe('open')
    expect(result.isAcceptingRequests).toBe(true)
    expect(result.endTime).toBe(endTime)
    expect(result.closesAtFormatted).toMatch(/\d{2} \w{3} \d{4}/)
  })
})

describe('toVaultMetricsDisplay', () => {
  it('formats raw metrics', () => {
    const result = toVaultMetricsDisplay({
      tvl: 50_000_000_000_000_000_000n,
      apy: 85_000_000n,
      pricePerShare: 1_020_000_000_000_000_000n,
      timestamp: 1700000000,
    })
    expect(result.tvlFormatted).toBe('50')
    expect(result.apyFormatted).toBe('8.50')
    expect(result.pricePerShareFormatted).toBe('1.02')
    expect(result.timestamp).toBe(1700000000)
    expect(result.tvlRaw).toBe(50_000_000_000_000_000_000n)
    expect(result.pricePerShareRaw).toBe(1_020_000_000_000_000_000n)
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
    expect(result.fiatCurrentEarnings).toBe('$2,375.00 USD')
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
    expect(result.fiatCurrentEarnings).toBe('$0.00 USD')
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
    const result = toActiveRequestDisplay(req, null, 50000)
    expect(result.claimable).toBe(false)
    expect(result.lockedSharePriceFormatted).toBeNull()
    expect(result.finalizeId).toBe('1')
    expect(result.amountFormatted).toBe('0.5')
    expect(result.lastUpdatedFormatted).toBeDefined()
    expect(typeof result.lastUpdatedFormatted).toBe('string')
    expect(result.sharesFormatted).toBe('—')
    expect(result.usdEquivalentFormatted).toBe('$25,000.00 USD')
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
    const result = toActiveRequestDisplay(req, claimable, 50000)
    expect(result.claimable).toBe(true)
    expect(result.lockedSharePriceFormatted).toBe('1.02/share')
    expect(result.finalizeId).toBe('batch-1')
    expect(result.sharesFormatted).toBe('1')
    expect(result.usdEquivalentFormatted).toBe('$50,000.00 USD')
  })

  it('includes lastUpdatedFormatted from updated when present, else created', () => {
    const withUpdated = {
      id: 'req-3',
      type: 'deposit' as const,
      amount: 1n,
      status: 'pending' as const,
      epochId: '1',
      batchRedeemId: null,
      timestamps: { created: 1700000000, updated: 1700086400 },
      txHashes: {},
    }
    const resultUpdated = toActiveRequestDisplay(withUpdated, null, 0)
    expect(resultUpdated.lastUpdatedFormatted).toContain('2023')

    const withCreatedOnly = {
      id: 'req-4',
      type: 'deposit' as const,
      amount: 1n,
      status: 'pending' as const,
      epochId: '1',
      batchRedeemId: null,
      timestamps: { created: 1700000000 },
      txHashes: {},
    }
    const resultCreated = toActiveRequestDisplay(withCreatedOnly, null, 0)
    expect(resultCreated.lastUpdatedFormatted).toBeDefined()
    expect(resultCreated.lastUpdatedFormatted.length).toBeGreaterThan(0)
  })

  it('withdrawal has sharesFormatted from amount; deposit has "—"', () => {
    const depositReq = {
      id: 'd1',
      type: 'deposit' as const,
      amount: 2_000_000_000_000_000_000n,
      status: 'pending' as const,
      epochId: '1',
      batchRedeemId: null,
      timestamps: { created: 1700000000 },
      txHashes: {},
    }
    expect(toActiveRequestDisplay(depositReq, null, 0).sharesFormatted).toBe('—')

    const withdrawalReq = {
      id: 'w1',
      type: 'withdrawal' as const,
      amount: 3_500_000_000_000_000_000n,
      status: 'pending' as const,
      epochId: null,
      batchRedeemId: null,
      timestamps: { created: 1700000000 },
      txHashes: {},
    }
    expect(toActiveRequestDisplay(withdrawalReq, null, 0).sharesFormatted).toBe('3.5')
  })
})

describe('mapRequestDisplayStatus', () => {
  it('maps pending to "Pending"', () => {
    const result = mapRequestDisplayStatus('pending', 'deposit')
    expect(result.displayStatus).toBe('pending')
    expect(result.displayStatusLabel).toBe('Pending')
  })

  it('maps claimable deposit to "Open to claim"', () => {
    const result = mapRequestDisplayStatus('claimable', 'deposit')
    expect(result.displayStatus).toBe('open_to_claim')
    expect(result.displayStatusLabel).toBe('Open to claim')
  })

  it('maps claimable withdrawal to "Claim pending"', () => {
    const result = mapRequestDisplayStatus('claimable', 'withdrawal')
    expect(result.displayStatus).toBe('claim_pending')
    expect(result.displayStatusLabel).toBe('Claim pending')
  })

  it('maps done to "Successful"', () => {
    const result = mapRequestDisplayStatus('done', 'deposit')
    expect(result.displayStatus).toBe('successful')
    expect(result.displayStatusLabel).toBe('Successful')
  })

  it('maps failed without reason to "Cancelled"', () => {
    const result = mapRequestDisplayStatus('failed', 'deposit')
    expect(result.displayStatus).toBe('cancelled')
    expect(result.displayStatusLabel).toBe('Cancelled')
  })

  it('maps failed with cancelled reason to "Cancelled"', () => {
    const result = mapRequestDisplayStatus('failed', 'withdrawal', 'cancelled')
    expect(result.displayStatus).toBe('cancelled')
    expect(result.displayStatusLabel).toBe('Cancelled')
  })

  it('maps failed with rejected reason to "Rejected"', () => {
    const result = mapRequestDisplayStatus('failed', 'deposit', 'rejected')
    expect(result.displayStatus).toBe('rejected')
    expect(result.displayStatusLabel).toBe('Rejected')
  })
})

describe('toPaginatedHistoryDisplay', () => {
  it('formats paginated results with tx hashes and display status', () => {
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
    expect(result.rows[0].displayStatus).toBe('successful')
    expect(result.rows[0].displayStatusLabel).toBe('Successful')
    expect(result.rows[0].claimTokenType).toBe('rbtc')
    expect(result.rows[0].fiatAmountFormatted).not.toBeNull()
    expect(result.rows[0].updatedAtFormatted).toMatch(/\d{2} \w{3} \d{4}/)
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
    expect(result.rows[0].displayStatus).toBe('pending')
  })

  it('sets claimTokenType to shares for withdrawals and null fiat amount', () => {
    const raw = {
      data: [
        {
          id: 'req-3',
          type: 'withdrawal' as const,
          amount: 600_000_000_000_000_000_000n,
          status: 'done' as const,
          epochId: null,
          batchRedeemId: 'batch-1',
          timestamps: { created: 1700000000, finalized: 1700003600 },
          txHashes: { submit: '0x' + 'c'.repeat(64) },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
    const result = toPaginatedHistoryDisplay(raw)
    expect(result.rows[0].claimTokenType).toBe('shares')
    expect(result.rows[0].fiatAmountFormatted).toBeNull()
    expect(result.rows[0].displayStatus).toBe('successful')
  })

  it('maps claimable deposit to open_to_claim display status', () => {
    const raw = {
      data: [
        {
          id: 'req-4',
          type: 'deposit' as const,
          amount: 1_000_000_000_000_000_000n,
          status: 'claimable' as const,
          epochId: '2',
          batchRedeemId: null,
          timestamps: { created: 1700000000 },
          txHashes: { submit: '0x' + 'a'.repeat(64) },
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
    const result = toPaginatedHistoryDisplay(raw)
    expect(result.rows[0].displayStatus).toBe('open_to_claim')
    expect(result.rows[0].displayStatusLabel).toBe('Open to claim')
  })

  it('includes updatedAtFormatted from updated when present, else created', () => {
    const withUpdated = {
      data: [
        {
          id: 'req-updated',
          type: 'deposit' as const,
          amount: 1n,
          status: 'pending' as const,
          epochId: '1',
          batchRedeemId: null,
          timestamps: { created: 1700000000, updated: 1700086400 },
          txHashes: {},
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    }
    const result = toPaginatedHistoryDisplay(withUpdated)
    expect(result.rows[0].updatedAtFormatted).toContain('2023')
  })

  it('maps failed with failureReason to correct display status', () => {
    const raw = {
      data: [
        {
          id: 'req-5',
          type: 'deposit' as const,
          amount: 1n,
          status: 'failed' as const,
          failureReason: 'rejected' as const,
          epochId: '0',
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
    expect(result.rows[0].displayStatus).toBe('rejected')
    expect(result.rows[0].displayStatusLabel).toBe('Rejected')
  })
})

describe('apiHistoryToPaginatedDisplay', () => {
  it('maps API response with multiple rows and pagination fields', () => {
    const response = {
      data: [
        {
          id: '0xuser1-1',
          user: '0xuser1',
          action: 'DEPOSIT_REQUEST',
          assets: '1000000000000000000',
          shares: '0',
          epochId: '1',
          timestamp: 1700000000,
          blockNumber: '123',
          transactionHash: '0x' + 'a'.repeat(64),
          displayStatus: 'pending' as const,
        },
        {
          id: '0xuser2-2',
          user: '0xuser2',
          action: 'REDEEM_CLAIMED',
          assets: '0',
          shares: '2000000000000000000',
          epochId: '2',
          timestamp: 1700003600,
          blockNumber: '456',
          transactionHash: '0x' + 'b'.repeat(64),
          displayStatus: 'successful' as const,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 42,
        totalPages: 3,
        offset: 0,
        sort_field: 'timestamp',
        sort_direction: 'desc' as const,
      },
    }
    const result = apiHistoryToPaginatedDisplay(response)
    expect(result.rows).toHaveLength(2)
    expect(result.total).toBe(42)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
    expect(result.totalPages).toBe(3)
  })

  it('maps row fields: displayStatus, amountFormatted, submitTxShort, claimTokenType, status', () => {
    const response = {
      data: [
        {
          id: 'id-1',
          user: '0xu',
          action: 'DEPOSIT_CLAIMED',
          assets: '1500000000000000000',
          shares: '0',
          epochId: '1',
          timestamp: 1700000000,
          blockNumber: '1',
          transactionHash: '0xabcd1234567890',
          displayStatus: 'successful' as const,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        offset: 0,
        sort_field: 'timestamp',
        sort_direction: 'desc' as const,
      },
    }
    const result = apiHistoryToPaginatedDisplay(response)
    const row = result.rows[0]
    expect(row.displayStatus).toBe('successful')
    expect(row.displayStatusLabel).toBe('Successful')
    expect(row.amountFormatted).toBe('1.5')
    expect(row.submitTxShort).toBe('0xabcd...7890')
    expect(row.submitTxFull).toBe('0xabcd1234567890')
    expect(row.claimTokenType).toBe('rbtc')
    expect(row.status).toBe('done')
    expect(row.type).toBe('deposit')
    expect(row.createdAtFormatted).toMatch(/\w{3} \d{1,2}, \d{4}/) // e.g. "Mar 17, 2026"
    expect(row.updatedAtFormatted).toMatch(/\d{2} \w{3} \d{4}/)
    expect(row.fiatAmountFormatted).toBeNull()
    expect(row.finalizedAtFormatted).toBeNull()
    expect(row.finalizeTxShort).toBeNull()
    expect(row.finalizeTxFull).toBeNull()
  })

  it('maps redeem_* to withdrawal, shares amount, claimTokenType shares', () => {
    const response = {
      data: [
        {
          id: 'id-2',
          user: '0xu',
          action: 'REDEEM_REQUEST',
          assets: '0',
          shares: '3000000000000000000',
          epochId: '2',
          timestamp: 1700086400,
          blockNumber: '2',
          transactionHash: '',
          displayStatus: 'claim_pending' as const,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        offset: 0,
        sort_field: 'timestamp',
        sort_direction: 'desc' as const,
      },
    }
    const result = apiHistoryToPaginatedDisplay(response)
    const row = result.rows[0]
    expect(row.type).toBe('withdrawal')
    expect(row.amountFormatted).toBe('3')
    expect(row.claimTokenType).toBe('shares')
    expect(row.displayStatus).toBe('claim_pending')
    expect(row.displayStatusLabel).toBe('Claim pending')
    expect(row.status).toBe('claimable')
    expect(row.submitTxShort).toBeNull()
    expect(row.submitTxFull).toBeNull()
  })

  it('defaults displayStatus to pending when missing', () => {
    const response = {
      data: [
        {
          id: 'id-3',
          user: '0xu',
          action: 'DEPOSIT_REQUEST',
          assets: '0',
          shares: '0',
          epochId: '1',
          timestamp: 1700000000,
          blockNumber: '1',
          transactionHash: '',
          displayStatus: undefined,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        offset: 0,
        sort_field: 'timestamp',
        sort_direction: 'desc' as const,
      },
    }
    const result = apiHistoryToPaginatedDisplay(response)
    expect(result.rows[0].displayStatus).toBe('pending')
    expect(result.rows[0].displayStatusLabel).toBe('Pending')
    expect(result.rows[0].status).toBe('pending')
  })

  it('maps cancelled and rejected to correct RequestStatus', () => {
    const response = {
      data: [
        {
          id: 'c',
          user: '0xu',
          action: 'DEPOSIT_CANCELLED',
          assets: '0',
          shares: '0',
          epochId: '1',
          timestamp: 1700000000,
          blockNumber: '1',
          transactionHash: '',
          displayStatus: 'cancelled' as const,
        },
        {
          id: 'r',
          user: '0xu',
          action: 'REDEEM_REQUEST',
          assets: '0',
          shares: '0',
          epochId: '1',
          timestamp: 1700000000,
          blockNumber: '1',
          transactionHash: '',
          displayStatus: 'rejected' as const,
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        offset: 0,
        sort_field: 'timestamp',
        sort_direction: 'desc' as const,
      },
    }
    const result = apiHistoryToPaginatedDisplay(response)
    expect(result.rows[0].status).toBe('cancelled')
    expect(result.rows[1].status).toBe('failed')
  })
})

describe('toCapitalAllocationDisplay', () => {
  it('maps three categories with correct amounts, percentages, and USD values', () => {
    const raw = {
      categories: [
        { label: 'Deployed capital', amount: WeiPerEther / 2n },
        { label: 'Liquidity reserve', amount: WeiPerEther / 4n },
        { label: 'Unallocated capital', amount: WeiPerEther / 4n },
      ],
      totalCapital: WeiPerEther,
      wallets: [],
    }
    const result = toCapitalAllocationDisplay(raw, 50000)

    expect(result.categories).toHaveLength(3)

    expect(result.categories[0].label).toBe('Deployed capital')
    expect(result.categories[0].amountFormatted).toBe('0.5')
    expect(result.categories[0].percentFormatted).toBe('50%')
    expect(result.categories[0].fiatAmountFormatted).toBe('$25,000.00 USD')

    expect(result.categories[1].label).toBe('Liquidity reserve')
    expect(result.categories[1].amountFormatted).toBe('0.25')
    expect(result.categories[1].percentFormatted).toBe('25%')
    expect(result.categories[1].fiatAmountFormatted).toBe('$12,500.00 USD')

    expect(result.categories[2].label).toBe('Unallocated capital')
    expect(result.categories[2].amountFormatted).toBe('0.25')
    expect(result.categories[2].percentFormatted).toBe('25%')
    expect(result.categories[2].fiatAmountFormatted).toBe('$12,500.00 USD')
  })

  it('handles zero total capital without division by zero', () => {
    const raw = {
      categories: [{ label: 'Deployed capital', amount: 0n }],
      totalCapital: 0n,
      wallets: [],
    }
    const result = toCapitalAllocationDisplay(raw, 50000)

    expect(result.categories[0].percentFormatted).toBe('0%')
    expect(result.categories[0].amountFormatted).toBe('0')
  })

  it('returns $0.00 USD fiat amounts when rbtcPrice is 0', () => {
    const raw = {
      categories: [
        { label: 'Deployed capital', amount: WeiPerEther },
        { label: 'Liquidity reserve', amount: WeiPerEther / 2n },
      ],
      totalCapital: (WeiPerEther * 3n) / 2n,
      wallets: [],
    }
    const result = toCapitalAllocationDisplay(raw, 0)

    expect(result.categories[0].fiatAmountFormatted).toBe('$0.00 USD')
    expect(result.categories[1].fiatAmountFormatted).toBe('$0.00 USD')
  })
})

describe('toWalletBalanceDisplay', () => {
  it('formats wallet balance with correct amount, fiat, and percentage', () => {
    const wallet = {
      label: 'Fordefi 1',
      trackingPlatform: 'Nimbus',
      trackingUrl: 'https://app.nimbus.io',
      amount: WeiPerEther * 10n,
      percentOfTotal: 96.49,
    }
    const result = toWalletBalanceDisplay(wallet, 50000)

    expect(result.label).toBe('Fordefi 1')
    expect(result.trackingPlatform).toBe('Nimbus')
    expect(result.trackingUrl).toBe('https://app.nimbus.io')
    expect(result.amountFormatted).toBe('10')
    expect(result.fiatAmountFormatted).toBe('$500,000.00 USD')
    expect(result.percentFormatted).toBe('96.49%')
  })

  it('returns $0.00 USD when rbtcPrice is 0', () => {
    const wallet = {
      label: 'Fordefi 2',
      trackingPlatform: 'Suivision',
      trackingUrl: 'https://suivision.xyz',
      amount: WeiPerEther,
      percentOfTotal: 0.5,
    }
    const result = toWalletBalanceDisplay(wallet, 0)

    expect(result.amountFormatted).toBe('1')
    expect(result.fiatAmountFormatted).toBe('$0.00 USD')
    expect(result.percentFormatted).toBe('0.5%')
  })
})
