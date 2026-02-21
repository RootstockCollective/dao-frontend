import type {
  VaultMetrics,
  EpochState,
  PauseState,
  UserPosition,
  EligibilityStatus,
  VaultRequest,
} from '../types'

// ─── Constants ───────────────────────────────────────────────────────

const ONE_BTC = 10n ** 18n // 18 decimals (rBTC uses Wei format)
const BASIS_POINTS_100_PERCENT = 10n ** 9n

export const MOCK_USER_A = '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa'
export const MOCK_USER_B = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'

// ─── Vault Metrics ───────────────────────────────────────────────────
// TVL = 50 BTC, APY = 8.5%, NAV = 1.02 BTC/share

export const SEED_METRICS: VaultMetrics = {
  tvl: 50n * ONE_BTC,
  apy: (BASIS_POINTS_100_PERCENT * 85n) / 1000n, // 8.5%
  nav: (ONE_BTC * 102n) / 100n, // 1.02 BTC/share
  timestamp: Math.floor(Date.now() / 1000),
}

// ─── Epoch State ─────────────────────────────────────────────────────

const now = Math.floor(Date.now() / 1000)

export const SEED_EPOCH: EpochState = {
  epochId: '1',
  status: 'open',
  startTime: now,
  endTime: now + 10,
  settledAt: null,
  navPerShare: null,
  totalDepositAssets: 5n * ONE_BTC,
  totalRedemptionShares: 2n * ONE_BTC,
}

// ─── Pause State ─────────────────────────────────────────────────────

export const SEED_PAUSE: PauseState = {
  deposits: 'active',
  withdrawals: 'active',
}

// ─── User Positions ──────────────────────────────────────────────────
// User A: owns ~10% of 50 BTC vault = 5.1 BTC position value

export const SEED_USERS: Record<string, UserPosition> = {
  [MOCK_USER_A]: {
    rbtcBalance: 2n * ONE_BTC,
    vaultTokens: 5n * ONE_BTC, // 5 shares (in 18-decimal format)
    positionValue: (51n * ONE_BTC) / 10n, // 5.1 BTC
    percentOfVault: 10.2,
  },
  [MOCK_USER_B]: {
    rbtcBalance: 0n,
    vaultTokens: 0n,
    positionValue: 0n,
    percentOfVault: 0,
  },
}

// ─── Eligibility ─────────────────────────────────────────────────────

export const SEED_ELIGIBILITY: Record<string, EligibilityStatus> = {
  [MOCK_USER_A]: { eligible: true, reason: '' },
  [MOCK_USER_B]: { eligible: true, reason: '' },
}

// ─── Default empty profiles for unknown addresses ────────────────────

export const EMPTY_USER_POSITION: UserPosition = {
  rbtcBalance: 0n,
  vaultTokens: 0n,
  positionValue: 0n,
  percentOfVault: 0,
}

export const EMPTY_ELIGIBILITY: EligibilityStatus = {
  eligible: false,
  reason: 'Unknown address',
}

// ─── Seed Requests (8 total: all type/status combos) ─────────────────

const pastEpochId = '0'
const currentEpochId = '1'
const pastBatchId = 'batch-0'
const currentBatchId = 'batch-1'
const pastTime = now - 3600

function mockTxHash(suffix: string): string {
  return `0x${suffix.padStart(64, '0')}`
}

export const SEED_REQUESTS: VaultRequest[] = [
  // Deposit pending — User A, current epoch
  {
    id: 'req-deposit-pending',
    type: 'deposit',
    amount: ONE_BTC / 2n, // 0.5 BTC
    status: 'pending',
    epochId: currentEpochId,
    batchRedeemId: null,
    timestamps: { created: now - 60 },
    txHashes: { submit: mockTxHash('d1') },
  },
  // Deposit claimable — User A, past epoch settled
  {
    id: 'req-deposit-claimable',
    type: 'deposit',
    amount: ONE_BTC,
    status: 'claimable',
    epochId: pastEpochId,
    batchRedeemId: null,
    timestamps: { created: pastTime, updated: pastTime + 600 },
    txHashes: { submit: mockTxHash('d2') },
  },
  // Deposit done — completed in past
  {
    id: 'req-deposit-done',
    type: 'deposit',
    amount: 2n * ONE_BTC,
    status: 'done',
    epochId: pastEpochId,
    batchRedeemId: null,
    timestamps: { created: pastTime - 7200, updated: pastTime - 6600, finalized: pastTime - 6000 },
    txHashes: { submit: mockTxHash('d3'), finalize: mockTxHash('d3f') },
  },
  // Deposit failed
  {
    id: 'req-deposit-failed',
    type: 'deposit',
    amount: ONE_BTC / 4n, // 0.25 BTC
    status: 'failed',
    epochId: pastEpochId,
    batchRedeemId: null,
    timestamps: { created: pastTime - 3600, updated: pastTime - 3000 },
    txHashes: { submit: mockTxHash('d4') },
  },
  // Withdrawal pending — User A, current batch
  {
    id: 'req-withdrawal-pending',
    type: 'withdrawal',
    amount: ONE_BTC / 2n,
    status: 'pending',
    epochId: null,
    batchRedeemId: currentBatchId,
    timestamps: { created: now - 30 },
    txHashes: { submit: mockTxHash('w1') },
  },
  // Withdrawal claimable
  {
    id: 'req-withdrawal-claimable',
    type: 'withdrawal',
    amount: ONE_BTC,
    status: 'claimable',
    epochId: null,
    batchRedeemId: pastBatchId,
    timestamps: { created: pastTime, updated: pastTime + 600 },
    txHashes: { submit: mockTxHash('w2') },
  },
  // Withdrawal done
  {
    id: 'req-withdrawal-done',
    type: 'withdrawal',
    amount: (3n * ONE_BTC) / 2n, // 1.5 BTC
    status: 'done',
    epochId: null,
    batchRedeemId: pastBatchId,
    timestamps: { created: pastTime - 7200, updated: pastTime - 6600, finalized: pastTime - 6000 },
    txHashes: { submit: mockTxHash('w3'), finalize: mockTxHash('w3f') },
  },
  // Withdrawal failed
  {
    id: 'req-withdrawal-failed',
    type: 'withdrawal',
    amount: ONE_BTC / 4n,
    status: 'failed',
    epochId: null,
    batchRedeemId: pastBatchId,
    timestamps: { created: pastTime - 3600, updated: pastTime - 3000 },
    txHashes: { submit: mockTxHash('w4') },
  },
]

// ─── Request ownership (which user owns which requests) ──────────────

export const SEED_REQUEST_OWNERSHIP: Record<string, string[]> = {
  [MOCK_USER_A]: SEED_REQUESTS.map(r => r.id),
  [MOCK_USER_B]: [],
}

// User A has the deposit-pending request as their active request
export const SEED_ACTIVE_REQUESTS: Record<string, string> = {
  [MOCK_USER_A]: 'req-deposit-pending',
}

// ─── Store factory ───────────────────────────────────────────────────

export interface MockStore {
  metrics: VaultMetrics
  epoch: EpochState
  pause: PauseState
  users: Map<string, UserPosition>
  eligibility: Map<string, EligibilityStatus>
  requests: Map<string, VaultRequest>
  requestOwnership: Map<string, string[]>
  activeRequestByUser: Map<string, string>
}

function cloneRequest(r: VaultRequest): VaultRequest {
  return {
    ...r,
    timestamps: { ...r.timestamps },
    txHashes: { ...r.txHashes },
  }
}

export function createInitialStore(): MockStore {
  const requests = new Map<string, VaultRequest>()
  for (const r of SEED_REQUESTS) {
    requests.set(r.id, cloneRequest(r))
  }

  const requestOwnership = new Map<string, string[]>()
  for (const [addr, ids] of Object.entries(SEED_REQUEST_OWNERSHIP)) {
    requestOwnership.set(addr, [...ids])
  }

  const activeRequestByUser = new Map<string, string>()
  for (const [addr, reqId] of Object.entries(SEED_ACTIVE_REQUESTS)) {
    activeRequestByUser.set(addr, reqId)
  }

  return {
    metrics: { ...SEED_METRICS, timestamp: Math.floor(Date.now() / 1000) },
    epoch: {
      ...SEED_EPOCH,
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 10,
    },
    pause: { ...SEED_PAUSE },
    users: new Map(Object.entries(SEED_USERS).map(([k, v]) => [k, { ...v }])),
    eligibility: new Map(Object.entries(SEED_ELIGIBILITY).map(([k, v]) => [k, { ...v }])),
    requests,
    requestOwnership,
    activeRequestByUser,
  }
}
