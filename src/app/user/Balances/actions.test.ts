import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { NextPageParams } from './types'

import { fetchNftHoldersOfAddress, fetchTokenHoldersOfAddress } from './actions'

vi.mock('@/lib/constants', () => ({
  CHAIN_ID: '30',
  RBTC: 'rBTC',
  RIF: 'RIF',
  STRIF: 'stRIF',
  USDRIF: 'USDRIF',
  USDT0: 'USDT0',
}))
vi.mock('@/lib/contracts', () => ({
  GovernorAddress: '0x2109ca19cb7c87dbdcb44d40c4a7eb0a3d5d1c9e',
  tokenContracts: {},
}))
vi.mock('@/lib/blockscout/fetch-logs-by-topic', () => ({ fetchLogsByTopic: vi.fn() }))

const TOKEN = '0xa7671bd525f529b60bf9f6c28fbe5d64f2cd0d73'
const API_KEY = 'proapi_configured_key'

/** `nextParams` crosses a `'use server'` boundary, so its keys are whatever was POSTed. */
const asCursor = (params: Record<string, unknown>) => params as unknown as NextPageParams

const calledUrl = () => new URL((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0])

describe('Blockscout pagination cursors', () => {
  const originalFetch = global.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BLOCKSCOUT_URL = 'https://rootstock.blockscout.test'
    process.env.BLOCKSCOUT_API_KEY = API_KEY
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], next_page_params: null }),
    })
  })

  afterEach(() => {
    global.fetch = originalFetch
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  it('forwards the cursor fields Blockscout actually sends', async () => {
    await fetchTokenHoldersOfAddress(TOKEN, asCursor({ items_count: 50, value: '1234' }))

    const url = calledUrl()
    expect(url.searchParams.get('items_count')).toBe('50')
    expect(url.searchParams.get('value')).toBe('1234')
  })

  it('drops names outside the cursor allowlist instead of putting them on an authenticated call', async () => {
    await fetchTokenHoldersOfAddress(TOKEN, asCursor({ items_count: 50, evil: 'x', chain_id: '1' }))

    const url = calledUrl()
    expect(url.searchParams.get('evil')).toBeNull()
    expect(url.searchParams.get('chain_id')).toBeNull()
    // The legitimate cursor still survives alongside them.
    expect(url.searchParams.get('items_count')).toBe('50')
  })

  it('never lets a caller replace the PRO API key', async () => {
    await fetchTokenHoldersOfAddress(TOKEN, asCursor({ apikey: 'attacker_supplied' }))

    expect(calledUrl().searchParams.get('apikey')).toBe(API_KEY)
  })

  it('applies the same allowlist to the NFT holders action', async () => {
    await fetchNftHoldersOfAddress(TOKEN, asCursor({ items_count: 10, apikey: 'attacker_supplied' }))

    const url = calledUrl()
    expect(url.searchParams.get('apikey')).toBe(API_KEY)
    expect(url.searchParams.get('items_count')).toBe('10')
  })

  it('sends no cursor at all on the first page', async () => {
    await fetchTokenHoldersOfAddress(TOKEN, null)

    expect([...calledUrl().searchParams.keys()]).toEqual(['apikey'])
  })
})
