import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TRANSPARENCY_WALLET_LABEL } from '@/app/btc-vault/components/capital-allocation/WalletBalancesTable.constants'
import { RBTC } from '@/lib/constants'

import { useCapitalAllocation } from './useCapitalAllocation'

const mockUseReadContracts = vi.fn()
const mockUseBalance = vi.fn()
const mockUsePricesContext = vi.fn()
const mockUseReadRbtcBuffer = vi.fn()

vi.mock('wagmi', () => ({
  useReadContracts: (...args: unknown[]) => mockUseReadContracts(...args),
  useBalance: (...args: unknown[]) => mockUseBalance(...args),
}))

vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => mockUsePricesContext(),
}))

vi.mock('@/shared/hooks/contracts/btc-vault', () => ({
  useReadRbtcBuffer: (...args: unknown[]) => mockUseReadRbtcBuffer(...args),
}))

const WEI_PER_ETHER = 10n ** 18n

function setupMocks({
  data,
  isLoading = false,
  error = undefined,
  rbtcPrice = 50_000,
  balanceWei = 0n,
  bufferAssets = 0n,
  bufferLoading = false,
  bufferError = undefined,
}: {
  data?: { result: bigint }[]
  isLoading?: boolean
  error?: Error
  rbtcPrice?: number
  balanceWei?: bigint
  bufferAssets?: bigint
  bufferLoading?: boolean
  bufferError?: Error
} = {}) {
  mockUseReadContracts.mockReturnValue({
    data,
    isLoading,
    error,
  })
  mockUseReadRbtcBuffer.mockReturnValue({
    data: bufferAssets,
    isLoading: bufferLoading,
    error: bufferError,
  })
  mockUseBalance.mockReturnValue({
    data: balanceWei !== undefined ? { value: balanceWei, decimals: 18 } : undefined,
    isLoading: false,
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

  it('maps contract results to categories: deployed=reportedOffchainAssets, reserve=freeOnchain+bufferAssets, unallocated=freeOnchainLiquidity', () => {
    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data?.categories[0].amountFormatted).toBe('0.5')
    expect(result.current.data?.categories[1].amountFormatted).toBe('0.25')
    expect(result.current.data?.categories[2].amountFormatted).toBe('0.25')
  })

  it('adds bufferAssets to liquidity reserve only', () => {
    setupMocks({
      data: [
        { result: WEI_PER_ETHER },
        { result: WEI_PER_ETHER / 4n },
        { result: WEI_PER_ETHER / 2n },
      ],
      bufferAssets: WEI_PER_ETHER / 4n,
    })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data?.categories[1].amountFormatted).toBe('0.5')
    expect(result.current.data?.categories[2].amountFormatted).toBe('0.25')
  })

  it('formats category percents as share of summed category amounts (includes buffer in reserve)', () => {
    setupMocks({
      data: [
        { result: 100n * WEI_PER_ETHER },
        { result: 10n * WEI_PER_ETHER },
        { result: 70n * WEI_PER_ETHER },
      ],
      bufferAssets: 5n * WEI_PER_ETHER,
    })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data).toBeDefined()
    // toCapitalAllocationDisplay: percent = amount / (70+15+10) — not totalAssets (100)
    expect(result.current.data?.categories[0].percentFormatted).toBe('73.68%')
    expect(result.current.data?.categories[1].percentFormatted).toBe('15.78%')
    expect(result.current.data?.categories[2].percentFormatted).toBe('10.52%')
  })

  it('exposes isLoading true when useReadContracts is loading', () => {
    setupMocks({ data: undefined, isLoading: true })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('exposes isLoading true when useReadRbtcBuffer is loading', () => {
    setupMocks({ bufferLoading: true })

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

  it('exposes isError true when useReadRbtcBuffer returns error', () => {
    setupMocks({ bufferError: new Error('Buffer read failed') })

    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.isError).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('includes one transparency wallet row with label and does not break display', () => {
    const { result } = renderHook(() => useCapitalAllocation())

    expect(result.current.data?.wallets).toHaveLength(1)
    expect(result.current.data?.wallets[0].label).toBe(TRANSPARENCY_WALLET_LABEL)
  })

  it('calls useReadContracts with vault contract configs and refetchInterval', () => {
    renderHook(() => useCapitalAllocation())

    expect(mockUseReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: expect.arrayContaining([
          expect.objectContaining({ functionName: 'totalAssets' }),
          expect.objectContaining({ functionName: 'freeOnchainLiquidity' }),
          expect.objectContaining({ functionName: 'reportedOffchainAssets' }),
        ]),
        query: expect.objectContaining({ refetchInterval: 60_000 }),
      }),
    )
    expect(mockUseReadRbtcBuffer).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bufferAssets' }),
    )
    expect(mockUseBalance).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ refetchInterval: 60_000 }),
      }),
    )
  })
})
