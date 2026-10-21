import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sortByVotingPower, useNftHoldersWithVotingPower } from './useNftHoldersWithVotingPower'

const mocks = vi.hoisted(() => ({
  cachedHolders: vi.fn(),
  fetch: vi.fn(),
}))

vi.mock('@/app/user/Delegation/server/fetchNftHoldersWithVotingPower', () => ({
  getCachedNftHoldersShepherds: mocks.cachedHolders,
}))

const LOW = '0x00000000000000000000000000000000000000Ab'
const HIGH = '0x00000000000000000000000000000000000000Cd'
const EMPTY = '0x00000000000000000000000000000000000000Ef'
const GONE = '0x0000000000000000000000000000000000000012'

const contributor = (id: string, votes: number) => ({
  id: id.toLowerCase(),
  delegatedVotes: '0',
  delegators: 1,
  votes,
  createdAt: '1738817290',
})

const jsonResponse = (body: unknown, ok = true) =>
  ({ ok, statusText: ok ? 'OK' : 'Internal Server Error', json: () => Promise.resolve(body) }) as Response

describe('useNftHoldersWithVotingPower', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch)
    mocks.fetch.mockImplementation((url: string) => {
      if (url === '/api/contributors/v1') {
        return Promise.resolve(
          jsonResponse([
            contributor(EMPTY, 44),
            contributor(LOW, 10),
            contributor(GONE, 3),
            contributor(HIGH, 150),
          ]),
        )
      }
      if (url === '/api/delegated-votes/v1') {
        return Promise.resolve(jsonResponse({ totalDelegatedVotes: '5000000000000000000000' }))
      }
      return Promise.reject(new Error(`unexpected fetch ${url}`))
    })
    mocks.cachedHolders.mockResolvedValue([
      { address: LOW, RNS: 'low.rsk', imageIpfs: null, votingPower: 100 },
      { address: HIGH, RNS: null, imageIpfs: 'ipfs://high', votingPower: 2500 },
      { address: EMPTY, RNS: null, imageIpfs: null, votingPower: 0 },
    ])
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('lists every vetted delegate on the explorer by voting power, keeping the ones without any', async () => {
    const { result } = renderHook(() => useNftHoldersWithVotingPower())

    await waitFor(() => expect(result.current.nftHolders).toHaveLength(3))

    const lower = (address: string) => address.toLowerCase()
    expect(result.current.nftHolders.map(h => h.address)).toEqual([HIGH, LOW, EMPTY].map(lower))
    expect(result.current.nftHolders[0]).toMatchObject({
      address: lower(HIGH),
      votingPower: 2500,
      totalVotes: 150,
      delegators: 1,
      imageIpfs: 'ipfs://high',
    })
    expect(result.current.nftHolders[2]).toMatchObject({
      address: lower(EMPTY),
      votingPower: 0,
      totalVotes: 44,
    })
  })

  it('exposes the total delegated voting power as a bigint', async () => {
    const { result } = renderHook(() => useNftHoldersWithVotingPower())

    await waitFor(() => expect(result.current.totalDelegatedVotes).toBe(5000n * 10n ** 18n))
  })

  it('still lists the delegates when the total delegated votes cannot be read', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    mocks.fetch.mockImplementation((url: string) =>
      Promise.resolve(
        url === '/api/contributors/v1' ? jsonResponse([contributor(HIGH, 150)]) : jsonResponse({}, false),
      ),
    )

    const { result } = renderHook(() => useNftHoldersWithVotingPower())

    await waitFor(() => expect(result.current.nftHolders).toHaveLength(1))
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch the total delegated votes',
        expect.any(Error),
      ),
    )
    expect(result.current.totalDelegatedVotes).toBeUndefined()
  })
})

describe('sortByVotingPower', () => {
  it('orders highest first without mutating the input', () => {
    const input = [{ votingPower: 1 }, { votingPower: 30 }, { votingPower: 2 }]

    expect(sortByVotingPower(input).map(h => h.votingPower)).toEqual([30, 2, 1])
    expect(input.map(h => h.votingPower)).toEqual([1, 30, 2])
  })
})
