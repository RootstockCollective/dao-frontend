import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { useCapitalAllocation } from './useCapitalAllocation'

const mockUseReadContracts = vi.fn()
const mockUsePricesContext = vi.fn()

vi.mock('wagmi', () => ({
  useReadContracts: (...args: unknown[]) => mockUseReadContracts(...args),
}))

vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => mockUsePricesContext(),
}))

const WEI_PER_ETHER = 10n ** 18n

function setupMocks({
  data,
  isLoading = false,
  error = undefined,
  rbtcPrice = 50_000,
}: {
  data?: { result: bigint }[]
  isLoading?: boolean
  error?: Error
  rbtcPrice?: number
} = {}) {
  mockUseReadContracts.mockReturnValue({
    data,
    isLoading,
    error,
  })
  mockUsePricesContext.mockReturnValue({
    prices: { [RBTC]: { price: rbtcPrice }, tRBTC: { price: rbtcPrice }, rBTC: { price: rbtcPrice } },
  })
}

describe('useCapitalAllocation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks({
      data: [
        { result: WEI_PER_ETHER },
        { result: WEI_PER_ETHER / 4n },
        { result: WEI_PER_ETHER / 4n },
        { result: WEI_PER_ETHER / 2n },
      ],
    })
  })

  it('returns formatted allocation with correct category labels when contract returns data', () => {
    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.categories).toHaveLength(3)
    expect(result.current.data?.categories[0].label).toBe('Deployed capital')
    expect(result.current.data?.categories[1].label).toBe('Liquidity reserve')
    expect(result.current.data?.categories[2].label).toBe('Unallocated capital')
  })

  it('maps contract results to categories: deployed=reportedOffchainAssets, reserve=freeOnchainLiquidity, unallocated=reservedOnchainAssets', () => {
    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data?.categories[0].amountFormatted).toBe('0.5')
    expect(result.current.data?.categories[1].amountFormatted).toBe('0.25')
    expect(result.current.data?.categories[2].amountFormatted).toBe('0.25')
  })

  it('uses totalAssets() result as totalCapital for display', () => {
    setupMocks({
      data: [
        { result: 100n * WEI_PER_ETHER },
        { result: 10n * WEI_PER_ETHER },
        { result: 20n * WEI_PER_ETHER },
        { result: 70n * WEI_PER_ETHER },
      ],
    })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.categories[0].percentFormatted).toBe('70%')
    expect(result.current.data?.categories[1].percentFormatted).toBe('10%')
    expect(result.current.data?.categories[2].percentFormatted).toBe('20%')
  })

  it('exposes isLoading true when useReadContracts is loading', () => {
    setupMocks({ data: undefined, isLoading: true })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('exposes isError true when useReadContracts returns error', () => {
    setupMocks({ data: undefined, error: new Error('Contract read failed') })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.isError).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('includes wallets array from mock (empty) and does not break display', () => {
    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data?.wallets).toEqual([])
  })

  it('calls useReadContracts with four contract configs and refetchInterval', () => {
    renderHook(() => useCapitalAllocation())

    expect(mockUseReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: expect.arrayContaining([
          expect.objectContaining({ functionName: 'totalAssets' }),
          expect.objectContaining({ functionName: 'freeOnchainLiquidity' }),
          expect.objectContaining({ functionName: 'reservedOnchainAssets' }),
          expect.objectContaining({ functionName: 'reportedOffchainAssets' }),
        ]),
        query: expect.objectContaining({ refetchInterval: 60_000 }),
      }),
    )
  })
})
