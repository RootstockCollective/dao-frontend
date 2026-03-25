import { describe, expect, it } from 'vitest'

import type { BtcVaultHistoryItem } from '../../types'
import type { EpochEventInfo } from './types'

import { promoteRequestActionsFromEpochMaps } from './fetch-epoch-events'

function row(base: Partial<BtcVaultHistoryItem>): BtcVaultHistoryItem {
  return {
    id: base.id ?? '0xtx-0',
    user: base.user ?? '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    action: base.action ?? 'DEPOSIT_REQUEST',
    assets: base.assets ?? '1',
    shares: base.shares ?? '0',
    epochId: base.epochId ?? '1',
    timestamp: base.timestamp ?? 100,
    blockNumber: base.blockNumber ?? '1',
    transactionHash: base.transactionHash ?? '0xtx',
  }
}

describe('promoteRequestActionsFromEpochMaps', () => {
  const settled = new Map<string, EpochEventInfo>([
    ['1', { epochId: '1', timestamp: 200, blockNumber: '2', transactionHash: '0xsettled' }],
  ])
  const fundingClaimable = new Map<string, EpochEventInfo>([
    ['1', { epochId: '1', timestamp: 300, blockNumber: '3', transactionHash: '0xfund', claimable: true }],
  ])
  const fundingNotClaimable = new Map<string, EpochEventInfo>([
    ['1', { epochId: '1', timestamp: 300, blockNumber: '3', transactionHash: '0xfund', claimable: false }],
  ])

  it('promotes DEPOSIT_REQUEST to DEPOSIT_CLAIMABLE when EpochSettled exists for epochId', () => {
    const rows = [row({ action: 'DEPOSIT_REQUEST', epochId: '1', id: 'r1' })]
    const out = promoteRequestActionsFromEpochMaps(rows, settled, new Map(), new Set())
    expect(out[0]?.action).toBe('DEPOSIT_CLAIMABLE')
    expect(out[0]?.transactionHash).toBe('0xtx')
  })

  it('does not promote DEPOSIT_REQUEST when cancelled', () => {
    const rows = [row({ action: 'DEPOSIT_REQUEST', epochId: '1', id: 'r1' })]
    const out = promoteRequestActionsFromEpochMaps(rows, settled, new Map(), new Set(['r1']))
    expect(out[0]?.action).toBe('DEPOSIT_REQUEST')
  })

  it('promotes REDEEM_REQUEST to REDEEM_ACCEPTED when settled, then REDEEM_CLAIMABLE when funding claimable', () => {
    const rows = [row({ action: 'REDEEM_REQUEST', epochId: '1', id: 'r2' })]
    const out = promoteRequestActionsFromEpochMaps(rows, settled, fundingClaimable, new Set())
    expect(out[0]?.action).toBe('REDEEM_CLAIMABLE')
  })

  it('promotes REDEEM_REQUEST to REDEEM_ACCEPTED only when funding is not claimable', () => {
    const rows = [row({ action: 'REDEEM_REQUEST', epochId: '1', id: 'r2' })]
    const out = promoteRequestActionsFromEpochMaps(rows, settled, fundingNotClaimable, new Set())
    expect(out[0]?.action).toBe('REDEEM_ACCEPTED')
  })

  it('leaves REDEEM_REQUEST when no EpochSettled', () => {
    const rows = [row({ action: 'REDEEM_REQUEST', epochId: '1' })]
    const out = promoteRequestActionsFromEpochMaps(rows, new Map(), fundingClaimable, new Set())
    expect(out[0]?.action).toBe('REDEEM_REQUEST')
  })
})
