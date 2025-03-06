import { useQuery } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAccount } from 'wagmi'
import { BoosterProvider, useFetchBoostData, useNFTBoosterContext } from './BoosterContext'

// Mock the external hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}))

// Helper function to safely stringify objects containing BigInts
const safeStringify = (obj: any) =>
  JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value))

const toExpected = (obj: any) => JSON.parse(safeStringify(obj))

const TestComponent = () => {
  const context = useNFTBoosterContext()
  return <pre data-testid="nft-booster-context-value">{safeStringify(context)}</pre>
}

describe('BoosterProvider', () => {
  // Reset mocks between tests
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Should return falsy hasActiveCampaign if latest file is set to None', async () => {
    ;(useAccount as any).mockReturnValue({ address: undefined })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'None', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: undefined, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue['hasActiveCampaign']).toBeFalsy()
    })
  })

  it('Should return falsy hasActiveCampaign if latest file is set to non-None value with no data', async () => {
    ;(useAccount as any).mockReturnValue({ address: undefined })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'some file', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: undefined, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue['hasActiveCampaign']).toBeFalsy()
    })
  })

  it('Should return truthy hasActiveCampaign if latest file is set to non-None value with data', async () => {
    const testBoostData = {
      nftContractAddress: '0x123',
      boostPercentage: BigInt(20),
      calculationBlock: BigInt(100),
      holders: {},
    }
    ;(useAccount as any).mockReturnValue({ address: undefined })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'some file', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: testBoostData, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue['hasActiveCampaign']).toBeTruthy()
    })
  })

  it('Should return an empty object if no boostData, isLoading and error', async () => {
    ;(useAccount as any).mockReturnValue({ address: undefined })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: undefined, isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: undefined, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue).toEqual({})
    })
  })

  it('Should return boostData, isLoading, error and hasActiveCampaign(true) if no address is present', async () => {
    const testBoostData = {
      nftContractAddress: '0x123',
      boostPercentage: BigInt(20),
      calculationBlock: BigInt(100),
      holders: {},
    }

    ;(useAccount as any).mockReturnValue({ address: undefined })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'latestFile', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: testBoostData, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue).toEqual(
        toExpected({
          boostData: testBoostData,
          isLoading: false,
          error: null,
          hasActiveCampaign: true,
        }),
      )
    })
  })

  it('Should return boostData, isLoading, error and currentBoost and hasActiveCampaign(true) if address is present and holder exists', async () => {
    const address = '0xABC'
    const holderRewards = {
      estimatedRBTCRewards: BigInt(10),
      estimatedRIFRewards: BigInt(20),
      boostedRBTCRewards: BigInt(30),
      boostedRIFRewards: BigInt(40),
    }
    const testBoostData = {
      nftContractAddress: '0x123',
      boostPercentage: BigInt(50),
      calculationBlock: BigInt(200),
      holders: {
        [address]: holderRewards,
      },
    }

    ;(useAccount as any).mockReturnValue({ address })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'latestFile', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: testBoostData, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue).toEqual(
        toExpected({
          boostData: testBoostData,
          isLoading: false,
          error: null,
          currentBoost: holderRewards,
          hasActiveCampaign: true,
          isBoosted: true,
        }),
      )
    })
  })

  it('Should return no currentBoost if address is present but no holder exists in boostData', async () => {
    const address = '0xDEF'
    const testBoostData = {
      nftContractAddress: '0x123',
      boostPercentage: BigInt(50),
      calculationBlock: BigInt(200),
      holders: {},
    }

    ;(useAccount as any).mockReturnValue({ address })
    ;(useQuery as any)
      .mockImplementationOnce(() => ({ data: 'latestFile', isLoading: false, error: null })) // for latestFile query
      .mockImplementationOnce(() => ({ data: testBoostData, isLoading: false, error: null })) // for boostData query

    render(
      <BoosterProvider>
        <TestComponent />
      </BoosterProvider>,
    )

    await waitFor(() => {
      const elements = screen.getAllByTestId('nft-booster-context-value')
      const element = elements[elements.length - 1]
      const contextValue = JSON.parse(element.textContent || '{}')
      expect(contextValue).toEqual(
        toExpected({
          isBoosted: false,
          boostData: testBoostData,
          isLoading: false,
          error: null,
          hasActiveCampaign: true,
        }),
      )
    })
  })
})

describe('useFetchBoostData', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return hasActiveCampaign as false when latestFile is "None"', () => {
    // First useQuery call (for latest file) returns "None"
    ;(useQuery as any)
      .mockImplementationOnce(() => ({
        data: 'None',
        isLoading: false,
        error: null,
      }))
      // Second useQuery call (for boostData) – won't run because enabled is false
      .mockImplementationOnce(() => ({
        data: undefined,
        isLoading: false,
        error: null,
      }))

    const { result } = renderHook(() => useFetchBoostData())

    expect(result.current.hasActiveCampaign).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return hasActiveCampaign as false when latestFile is undefined', () => {
    ;(useQuery as any)
      .mockImplementationOnce(() => ({
        data: undefined,
        isLoading: false,
        error: null,
      }))
      .mockImplementationOnce(() => ({
        data: undefined,
        isLoading: false,
        error: null,
      }))

    const { result } = renderHook(() => useFetchBoostData())
    expect(result.current.hasActiveCampaign).toBe(false)
  })

  it('should return boost data and hasActiveCampaign as true when a valid latestFile is returned', () => {
    const testLatestFile = 'latest-file'
    const testBoostData = {
      nftContractAddress: '0x123',
      boostPercentage: BigInt(20),
      calculationBlock: BigInt(100),
      holders: {},
    }

    ;(useQuery as any)
      // Latest file query returns a valid file name
      .mockImplementationOnce(() => ({
        data: testLatestFile,
        isLoading: false,
        error: null,
      }))
      // Boost data query returns test data (enabled because latestFile is truthy and not "None")
      .mockImplementationOnce(() => ({
        data: testBoostData,
        isLoading: false,
        error: null,
      }))

    const { result } = renderHook(() => useFetchBoostData())

    expect(result.current.hasActiveCampaign).toBe(true)
    expect(result.current.data).toEqual(testBoostData)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should combine loading states from both queries', () => {
    // First query is loading (latestFile) and second is not loading
    ;(useQuery as any)
      .mockImplementationOnce(() => ({
        data: 'latest-file',
        isLoading: true,
        error: null,
      }))
      .mockImplementationOnce(() => ({
        data: undefined,
        isLoading: false,
        error: null,
      }))

    const { result } = renderHook(() => useFetchBoostData())
    // isLoading is a combination of both queries (true || false)
    expect(result.current.isLoading).toBe(true)
  })

  it('should combine error states from both queries', () => {
    const testError = new Error('Test error')
    ;(useQuery as any)
      .mockImplementationOnce(() => ({
        data: 'latest-file',
        isLoading: false,
        error: null,
      }))
      .mockImplementationOnce(() => ({
        data: undefined,
        isLoading: false,
        error: testError,
      }))

    const { result } = renderHook(() => useFetchBoostData())
    // error is taken from the boostData query when latestFile query has no error
    expect(result.current.error).toEqual(testError)
  })
})
