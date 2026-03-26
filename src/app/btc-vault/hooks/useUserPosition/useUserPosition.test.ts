import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUserPosition } from './useUserPosition'

const mockUseBalance = vi.fn()
const mockUseReadContracts = vi.fn()
const mockUseUserPrincipal = vi.fn()

vi.mock('wagmi', () => ({
  useBalance: (...args: unknown[]) => mockUseBalance(...args),
  useReadContracts: (...args: unknown[]) => mockUseReadContracts(...args),
}))

vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => ({
    prices: {
      RBTC: { price: 23_750 },
    },
  }),
}))

vi.mock('./useUserPrincipal', () => ({
  useUserPrincipal: (...args: unknown[]) => mockUseUserPrincipal(...args),
}))

const CONNECTED_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'
const ONE_ETHER = 1_000_000_000_000_000_000n

function setupMocks({
  balance,
  multicall,
  principal,
}: {
  balance?: { value: bigint }
  multicall?: { result: bigint }[]
  principal?: bigint
} = {}) {
  mockUseBalance.mockReturnValue({
    data: balance,
    isLoading: false,
    isError: false,
  })
  mockUseReadContracts.mockReturnValue({
    data: multicall,
    isLoading: false,
    isError: false,
  })
  mockUseUserPrincipal.mockReturnValue({
    data: principal ?? undefined,
    isLoading: false,
    isError: false,
  })
}

describe('useUserPosition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  describe('when wallet is disconnected', () => {
    it('returns undefined data', () => {
      const { result } = renderHook(() => useUserPosition(undefined))

      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isError).toBe(false)
    })

    it('passes enabled: false to useBalance', () => {
      renderHook(() => useUserPosition(undefined))

      expect(mockUseBalance).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ enabled: false }),
        }),
      )
    })
  })

  describe('when wallet is connected', () => {
    it('reads native rBTC balance via useBalance', () => {
      setupMocks({ balance: { value: 2n * ONE_ETHER } })

      renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(mockUseBalance).toHaveBeenCalledWith(
        expect.objectContaining({
          address: CONNECTED_ADDRESS,
          query: expect.objectContaining({ enabled: true, refetchInterval: 60_000 }),
        }),
      )
    })

    it('returns formatted position data from contract reads', () => {
      const vaultTokens = 5n * ONE_ETHER
      const totalSupply = 50n * ONE_ETHER
      const totalAssets = 51n * ONE_ETHER

      setupMocks({
        balance: { value: 2n * ONE_ETHER },
        multicall: [{ result: vaultTokens }, { result: totalSupply }, { result: totalAssets }],
      })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.rbtcBalanceFormatted).toBe('2')
      expect(result.current.data?.vaultTokensFormatted).toBe('5')
      expect(result.current.data?.positionValueFormatted).toBe('5.1')
      expect(result.current.data?.percentOfVaultFormatted).toBe('10.00%')
    })

    it('reports isLoading when any query is loading', () => {
      mockUseBalance.mockReturnValue({ data: undefined, isLoading: true, isError: false })
      mockUseReadContracts.mockReturnValue({ data: undefined, isLoading: false, isError: false })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.isLoading).toBe(true)
    })

    it('reports isError when any query has an error', () => {
      mockUseBalance.mockReturnValue({ data: undefined, isLoading: false, isError: true })
      mockUseReadContracts.mockReturnValue({ data: undefined, isLoading: false, isError: false })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.isError).toBe(true)
    })

    it('defaults totalDepositedPrincipal to 0n when principal API has not loaded', () => {
      setupMocks({
        balance: { value: ONE_ETHER },
        multicall: [{ result: ONE_ETHER }, { result: 10n * ONE_ETHER }, { result: 10n * ONE_ETHER }],
      })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.data?.totalDepositedPrincipalRaw).toBe(0n)
    })

    it('uses fetched principal when available', () => {
      const principal = 3n * ONE_ETHER
      setupMocks({
        balance: { value: ONE_ETHER },
        multicall: [{ result: ONE_ETHER }, { result: 10n * ONE_ETHER }, { result: 10n * ONE_ETHER }],
        principal,
      })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.data?.totalDepositedPrincipalRaw).toBe(principal)
    })

    it('reports isLoading when principal is loading', () => {
      mockUseBalance.mockReturnValue({ data: undefined, isLoading: false, isError: false })
      mockUseReadContracts.mockReturnValue({ data: undefined, isLoading: false, isError: false })
      mockUseUserPrincipal.mockReturnValue({ data: undefined, isLoading: true, isError: false })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.isLoading).toBe(true)
    })

    it('returns zero positionValue and percentOfVault when user has no vault tokens', () => {
      setupMocks({
        balance: { value: 3n * ONE_ETHER },
        multicall: [{ result: 0n }, { result: 100n * ONE_ETHER }, { result: 100n * ONE_ETHER }],
      })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.data?.positionValueFormatted).toBe('0')
      expect(result.current.data?.percentOfVaultFormatted).toBe('0.00%')
      expect(result.current.data?.vaultTokensFormatted).toBe('0')
      expect(result.current.data?.rbtcBalanceFormatted).toBe('3')
    })

    it('rounds percentOfVault to two decimal places via integer math', () => {
      // 1/3 of total supply → 33.33% (integer math: (1 * 10000) / 3 = 3333, / 100 = 33.33)
      setupMocks({
        balance: { value: ONE_ETHER },
        multicall: [{ result: ONE_ETHER }, { result: 3n * ONE_ETHER }, { result: 3n * ONE_ETHER }],
      })

      const { result } = renderHook(() => useUserPosition(CONNECTED_ADDRESS))

      expect(result.current.data?.percentOfVaultFormatted).toBe('33.33%')
    })
  })
})
