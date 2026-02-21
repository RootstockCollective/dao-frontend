import type {
  BtcVaultService,
  BtcVaultServiceEvent,
  BtcVaultServiceListener,
  ClaimableInfo,
  DepositRequestParams,
  EligibilityStatus,
  EpochState,
  MockBtcVaultConfig,
  PaginatedResult,
  PaginationParams,
  PauseState,
  TxResult,
  UserPosition,
  VaultMetrics,
  VaultRequest,
  WithdrawalRequestParams,
} from '../types'
import { createInitialStore, EMPTY_ELIGIBILITY, EMPTY_USER_POSITION, type MockStore } from './mockData'

const ONE_BTC = 10n ** 18n

const DEFAULT_CONFIG: Required<MockBtcVaultConfig> = {
  epochDuration: 10_000,
  closeDelay: 1_000,
  settleDelay: 2_000,
  nextEpochDelay: 3_000,
  txConfirmDelay: 1_500,
  txFailChance: 0,
  readLatency: 0, // 0 = random 200-500ms
}

let requestCounter = 100

function generateRequestId(): string {
  return `req-${++requestCounter}-${Date.now()}`
}

function generateTxHash(): string {
  const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  return `0x${hex}`
}

export class MockBtcVaultService implements BtcVaultService {
  private store: MockStore
  private config: Required<MockBtcVaultConfig>
  private timers = new Set<ReturnType<typeof setTimeout>>()
  private listeners = new Set<BtcVaultServiceListener>()
  private disposed = false

  // The mock needs a "current user" address for write operations.
  // In the real implementation this comes from the wallet connection.
  private currentUserAddress: string

  constructor(config?: MockBtcVaultConfig, currentUserAddress?: string) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.store = createInitialStore()
    this.currentUserAddress = currentUserAddress ?? '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa'
    this.startEpochCycle()
  }

  // ─── Vault-Level Reads ───────────────────────────────────────────

  async getVaultMetrics(): Promise<VaultMetrics> {
    return this.delay({ ...this.store.metrics })
  }

  async getEpochState(): Promise<EpochState> {
    return this.delay({ ...this.store.epoch })
  }

  async getPauseState(): Promise<PauseState> {
    return this.delay({ ...this.store.pause })
  }

  // ─── User-Level Reads ────────────────────────────────────────────

  async getUserPosition(address: string): Promise<UserPosition> {
    const pos = this.store.users.get(address)
    return this.delay(pos ? { ...pos } : { ...EMPTY_USER_POSITION })
  }

  async getEligibility(address: string): Promise<EligibilityStatus> {
    const elig = this.store.eligibility.get(address)
    return this.delay(elig ? { ...elig } : { ...EMPTY_ELIGIBILITY })
  }

  async getActiveRequests(address: string): Promise<VaultRequest[]> {
    const activeReqId = this.store.activeRequestByUser.get(address)
    if (!activeReqId) return this.delay([])

    const req = this.store.requests.get(activeReqId)
    if (!req) return this.delay([])

    return this.delay([this.cloneRequest(req)])
  }

  async getClaimableStatus(requestId: string): Promise<ClaimableInfo> {
    const req = this.store.requests.get(requestId)
    if (!req) {
      return this.delay({ claimable: false, lockedSharePrice: 0n })
    }
    const isClaimable = req.status === 'claimable'
    const lockedSharePrice = this.store.epoch.navPerShare ?? this.store.metrics.nav
    return this.delay({ claimable: isClaimable, lockedSharePrice })
  }

  // ─── History ─────────────────────────────────────────────────────

  async getRequestHistory(address: string, params: PaginationParams): Promise<PaginatedResult<VaultRequest>> {
    const ownedIds = this.store.requestOwnership.get(address) ?? []
    const allRequests = ownedIds
      .map(id => this.store.requests.get(id))
      .filter((r): r is VaultRequest => r !== undefined)

    // Sort
    const sorted = [...allRequests].sort((a, b) => {
      const field = params.sortField ?? 'created'
      const dir = params.sortDirection === 'asc' ? 1 : -1
      if (field === 'created') return (a.timestamps.created - b.timestamps.created) * dir
      if (field === 'amount') return Number(a.amount - b.amount) * dir
      return (a.timestamps.created - b.timestamps.created) * dir
    })

    const total = sorted.length
    const page = params.page
    const limit = params.limit
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const data = sorted.slice(start, start + limit).map(r => this.cloneRequest(r))

    return this.delay({ data, total, page, limit, totalPages })
  }

  // ─── Write Operations ────────────────────────────────────────────

  async submitDepositRequest(params: DepositRequestParams): Promise<TxResult> {
    this.assertNotDisposed()
    const address = this.currentUserAddress

    // Guards
    if (this.store.pause.deposits === 'paused') {
      throw new Error('Deposits are currently paused')
    }
    if (this.store.activeRequestByUser.has(address)) {
      throw new Error('User already has an active request')
    }
    if (params.amount <= 0n) {
      throw new Error('Amount must be greater than 0')
    }
    const elig = this.store.eligibility.get(address)
    if (!elig?.eligible) {
      throw new Error('User is not eligible for deposits')
    }

    // Create request
    const requestId = generateRequestId()
    const now = Math.floor(Date.now() / 1000)
    const txHash = generateTxHash()

    const request: VaultRequest = {
      id: requestId,
      type: 'deposit',
      amount: params.amount,
      status: 'pending',
      epochId: this.store.epoch.epochId,
      batchRedeemId: null,
      timestamps: { created: now },
      txHashes: { submit: txHash },
    }

    this.store.requests.set(requestId, request)
    this.store.activeRequestByUser.set(address, requestId)
    const owned = this.store.requestOwnership.get(address) ?? []
    owned.push(requestId)
    this.store.requestOwnership.set(address, owned)

    // Update epoch aggregates
    this.store.epoch.totalDepositAssets += params.amount

    this.notify({ type: 'request:submitted', requestId, requestType: 'deposit' })

    // Simulate tx confirmation after delay
    this.scheduleTimer(() => {
      if (this.shouldTxFail()) {
        request.status = 'failed'
        request.timestamps.updated = Math.floor(Date.now() / 1000)
        this.store.activeRequestByUser.delete(address)
        this.notify({ type: 'request:failed', requestId })
      } else {
        this.notify({ type: 'tx:confirmed', hash: txHash })
      }
    }, this.config.txConfirmDelay)

    return { hash: txHash, status: 'pending' }
  }

  async submitWithdrawalRequest(params: WithdrawalRequestParams): Promise<TxResult> {
    this.assertNotDisposed()
    const address = this.currentUserAddress

    // Guards
    if (this.store.pause.withdrawals === 'paused') {
      throw new Error('Withdrawals are currently paused')
    }
    if (this.store.activeRequestByUser.has(address)) {
      throw new Error('User already has an active request')
    }
    if (params.amount <= 0n) {
      throw new Error('Amount must be greater than 0')
    }
    const pos = this.store.users.get(address)
    if (!pos || pos.vaultTokens < params.amount) {
      throw new Error('Insufficient vault token balance')
    }

    // Create request
    const requestId = generateRequestId()
    const now = Math.floor(Date.now() / 1000)
    const txHash = generateTxHash()
    const batchRedeemId = `batch-${this.store.epoch.epochId}`

    const request: VaultRequest = {
      id: requestId,
      type: 'withdrawal',
      amount: params.amount,
      status: 'pending',
      epochId: null,
      batchRedeemId,
      timestamps: { created: now },
      txHashes: { submit: txHash },
    }

    this.store.requests.set(requestId, request)
    this.store.activeRequestByUser.set(address, requestId)
    const owned = this.store.requestOwnership.get(address) ?? []
    owned.push(requestId)
    this.store.requestOwnership.set(address, owned)

    // Update epoch aggregates
    this.store.epoch.totalRedemptionShares += params.amount

    this.notify({ type: 'request:submitted', requestId, requestType: 'withdrawal' })

    // Simulate tx confirmation
    this.scheduleTimer(() => {
      if (this.shouldTxFail()) {
        request.status = 'failed'
        request.timestamps.updated = Math.floor(Date.now() / 1000)
        this.store.activeRequestByUser.delete(address)
        this.notify({ type: 'request:failed', requestId })
      } else {
        this.notify({ type: 'tx:confirmed', hash: txHash })
      }
    }, this.config.txConfirmDelay)

    return { hash: txHash, status: 'pending' }
  }

  async finalizeDeposit(epochId: string): Promise<TxResult> {
    this.assertNotDisposed()
    const address = this.currentUserAddress

    if (this.store.pause.deposits === 'paused') {
      throw new Error('Deposits are currently paused — claiming is temporarily unavailable')
    }

    // Find the claimable deposit request for this epoch
    const request = this.findClaimableRequest(address, 'deposit', 'epochId', epochId)
    if (!request) {
      throw new Error(`No claimable deposit request found for epoch ${epochId}`)
    }

    const txHash = generateTxHash()
    const now = Math.floor(Date.now() / 1000)
    const navPerShare = this.store.epoch.navPerShare ?? this.store.metrics.nav

    // Atomically update request + user position + metrics
    request.status = 'done'
    request.timestamps.finalized = now
    request.timestamps.updated = now
    request.txHashes.finalize = txHash

    // Mint shares: shares = depositAmount / navPerShare
    const mintedShares = navPerShare > 0n ? (request.amount * ONE_BTC) / navPerShare : 0n

    const pos = this.store.users.get(address) ?? {
      rbtcBalance: 0n,
      vaultTokens: 0n,
      positionValue: 0n,
      percentOfVault: 0,
    }
    pos.vaultTokens += mintedShares
    pos.positionValue = (pos.vaultTokens * navPerShare) / ONE_BTC
    pos.percentOfVault =
      this.store.metrics.tvl > 0n ? Number((pos.positionValue * 10000n) / this.store.metrics.tvl) / 100 : 0
    this.store.users.set(address, pos)

    this.store.activeRequestByUser.delete(address)

    this.notify({ type: 'request:finalized', requestId: request.id })
    this.notify({ type: 'tx:confirmed', hash: txHash })

    return { hash: txHash, status: 'confirmed' }
  }

  async finalizeWithdrawal(batchRedeemId: string): Promise<TxResult> {
    this.assertNotDisposed()
    const address = this.currentUserAddress

    if (this.store.pause.withdrawals === 'paused') {
      throw new Error('Withdrawals are currently paused — claiming is temporarily unavailable')
    }

    const request = this.findClaimableRequest(address, 'withdrawal', 'batchRedeemId', batchRedeemId)
    if (!request) {
      throw new Error(`No claimable withdrawal request found for batch ${batchRedeemId}`)
    }

    const txHash = generateTxHash()
    const now = Math.floor(Date.now() / 1000)
    const navPerShare = this.store.epoch.navPerShare ?? this.store.metrics.nav

    // Atomically update request + user position
    request.status = 'done'
    request.timestamps.finalized = now
    request.timestamps.updated = now
    request.txHashes.finalize = txHash

    // Burn shares and return rBTC
    const rbtcReturned = (request.amount * navPerShare) / ONE_BTC
    const pos = this.store.users.get(address)
    if (pos) {
      pos.vaultTokens -= request.amount
      if (pos.vaultTokens < 0n) pos.vaultTokens = 0n
      pos.rbtcBalance += rbtcReturned
      pos.positionValue = (pos.vaultTokens * navPerShare) / ONE_BTC
      pos.percentOfVault =
        this.store.metrics.tvl > 0n ? Number((pos.positionValue * 10000n) / this.store.metrics.tvl) / 100 : 0
      this.store.users.set(address, pos)
    }

    // Update vault TVL
    this.store.metrics.tvl -= rbtcReturned
    if (this.store.metrics.tvl < 0n) this.store.metrics.tvl = 0n

    this.store.activeRequestByUser.delete(address)

    this.notify({ type: 'request:finalized', requestId: request.id })
    this.notify({ type: 'tx:confirmed', hash: txHash })

    return { hash: txHash, status: 'confirmed' }
  }

  // ─── Observability ───────────────────────────────────────────────

  subscribe(listener: BtcVaultServiceListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  // ─── Lifecycle ───────────────────────────────────────────────────

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const timer of this.timers) {
      clearTimeout(timer)
    }
    this.timers.clear()
    this.listeners.clear()
  }

  // ─── Pause control (for testing/visualizer) ──────────────────────

  setPauseState(region: 'deposits' | 'withdrawals', value: 'active' | 'paused'): void {
    this.store.pause[region] = value
    this.notify({
      type: 'pause:change',
      deposits: this.store.pause.deposits,
      withdrawals: this.store.pause.withdrawals,
    })
  }

  // ─── Internal: Epoch Cycle ───────────────────────────────────────

  private startEpochCycle(): void {
    this.scheduleEpochTransition('open')
  }

  private scheduleEpochTransition(currentStatus: string): void {
    if (this.disposed) return

    switch (currentStatus) {
      case 'open':
        this.scheduleTimer(() => {
          this.transitionEpoch('closed')
          this.scheduleEpochTransition('closed')
        }, this.config.epochDuration)
        break

      case 'closed':
        this.scheduleTimer(() => {
          this.transitionEpoch('settling')
          this.scheduleEpochTransition('settling')
        }, this.config.closeDelay)
        break

      case 'settling':
        this.scheduleTimer(() => {
          this.settleEpoch()
          this.scheduleEpochTransition('claimable')
        }, this.config.settleDelay)
        break

      case 'claimable':
        this.scheduleTimer(() => {
          this.openNextEpoch()
          this.scheduleEpochTransition('open')
        }, this.config.nextEpochDelay)
        break
    }
  }

  private transitionEpoch(newStatus: 'closed' | 'settling'): void {
    this.store.epoch.status = newStatus
    this.notify({
      type: 'epoch:transition',
      status: newStatus,
      epochId: this.store.epoch.epochId,
    })
  }

  private settleEpoch(): void {
    const now = Math.floor(Date.now() / 1000)
    this.store.epoch.status = 'claimable'
    this.store.epoch.settledAt = now
    this.store.epoch.navPerShare = this.store.metrics.nav

    // Transition all pending requests with matching epochId to claimable
    const currentEpochId = this.store.epoch.epochId
    const currentBatchId = `batch-${currentEpochId}`

    for (const req of this.store.requests.values()) {
      if (req.status !== 'pending') continue

      const matchesEpoch = req.type === 'deposit' && req.epochId === currentEpochId
      const matchesBatch = req.type === 'withdrawal' && req.batchRedeemId === currentBatchId

      if (matchesEpoch || matchesBatch) {
        req.status = 'claimable'
        req.timestamps.updated = now
        this.notify({ type: 'request:claimable', requestId: req.id })
      }
    }

    this.notify({
      type: 'epoch:transition',
      status: 'claimable',
      epochId: this.store.epoch.epochId,
    })
  }

  private openNextEpoch(): void {
    const now = Math.floor(Date.now() / 1000)
    const nextId = String(Number(this.store.epoch.epochId) + 1)

    this.store.epoch = {
      epochId: nextId,
      status: 'open',
      startTime: now,
      endTime: now + Math.floor(this.config.epochDuration / 1000),
      settledAt: null,
      navPerShare: null,
      totalDepositAssets: 0n,
      totalRedemptionShares: 0n,
    }

    this.store.metrics.timestamp = now

    this.notify({ type: 'epoch:transition', status: 'open', epochId: nextId })
  }

  // ─── Internal: Helpers ───────────────────────────────────────────

  private notify(event: BtcVaultServiceEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch {
        // Listeners should not throw, but don't let one break others
      }
    }
  }

  private delay<T>(value: T): Promise<T> {
    const ms = this.config.readLatency > 0 ? this.config.readLatency : 200 + Math.random() * 300
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        this.timers.delete(timer)
        resolve(value)
      }, ms)
      this.timers.add(timer)
    })
  }

  private scheduleTimer(fn: () => void, ms: number): void {
    if (this.disposed) return
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      if (!this.disposed) fn()
    }, ms)
    this.timers.add(timer)
  }

  private shouldTxFail(): boolean {
    return Math.random() < this.config.txFailChance
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error('Service has been disposed')
    }
  }

  private cloneRequest(r: VaultRequest): VaultRequest {
    return {
      ...r,
      timestamps: { ...r.timestamps },
      txHashes: { ...r.txHashes },
    }
  }

  private findClaimableRequest(
    address: string,
    type: 'deposit' | 'withdrawal',
    idField: 'epochId' | 'batchRedeemId',
    idValue: string,
  ): VaultRequest | undefined {
    const ownedIds = this.store.requestOwnership.get(address) ?? []
    for (const id of ownedIds) {
      const req = this.store.requests.get(id)
      if (req && req.type === type && req.status === 'claimable' && req[idField] === idValue) {
        return req
      }
    }
    return undefined
  }
}
