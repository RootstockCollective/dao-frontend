import {
  ProposalQueryResult,
  useFetchCreateBuilderProposals,
} from '@/app/proposals/hooks/useFetchLatestProposals'
import { ADDRESS_PADDING_LENGTH, RELAY_PARAMETER_PADDING_LENGTH } from '@/app/proposals/shared/utils'
import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { CRDeprecatedAbi } from '@/lib/abis/CRDeprecatedAbi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { prepareEncodeFunctionData, parseEventLogs } from 'viem'
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/app/user/Balances/actions', () => ({
  fetchProposalsCreatedCached: vi.fn(),
}))

const CR_WHITELIST_FUNCTION = 'whitelistBuilder' // v1
const CR_WHITELIST_FUNCTION_SELECTOR = prepareEncodeFunctionData({
  abi: CRDeprecatedAbi,
  functionName: CR_WHITELIST_FUNCTION,
}).functionName

vi.mock(import('viem'), async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    parseEventLogs: vi.fn(),
    getAddress: vi.fn().mockImplementation((address: string) => address),
  }
})

const builder_1 = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
const builder_2 = '0x45418b3cc0CF56847A8A3C3004961c572E259142'

// Create a new instance of QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: true, // Disable retries to simplify test logic
      },
    },
  })

// Reusable function to wrap renderHook with QueryClientProvider
const renderHookWithQueryClient = <P, R>(hook: (initialProps: P) => R) => {
  const queryClient = createTestQueryClient()

  return renderHook(hook, {
    wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
  })
}

const renderAndWaitForHook = async <P, R>(hook: (initialProps: P) => ProposalQueryResult<R>) => {
  const { result } = renderHookWithQueryClient(hook)

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  return result.current.data
}

const RELAY_FUNCTION = 'relay'
const RELAY_FUNCTION_SELECTOR = prepareEncodeFunctionData({
  abi: GovernorAbi,
  functionName: RELAY_FUNCTION,
}).functionName

const relayWrapper = (bytes: string) =>
  `${RELAY_FUNCTION_SELECTOR}${createPadding(RELAY_PARAMETER_PADDING_LENGTH)}${bytes.slice(2)}${createPadding(56)}`

const createPadding = (length: number) => '0'.repeat(length)

const mocFetchProposalsCreatedCached = fetchProposalsCreatedCached as Mock
const mockParseEventLogs = parseEventLogs as Mock

describe('useFetchCreateBuilderProposals', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should return an empty object when no data is fetched', async () => {
    mocFetchProposalsCreatedCached.mockReturnValue({ data: null })
    const expectedValue = {}

    const actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should return proposals', async () => {
    const mockProposalData = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 2000,
        },
      ],
    }

    const expectedValue = {
      [builder_1]: mockProposalData.data,
    }

    mocFetchProposalsCreatedCached.mockReturnValue(mockProposalData)
    mockParseEventLogs.mockReturnValue(mockProposalData.data)

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should handle proposals without calldatas', async () => {
    const mockDataWithoutCalldatas = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: [],
          },
          timeStamp: 1000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue({ data: mockDataWithoutCalldatas })
    mockParseEventLogs.mockReturnValue(mockDataWithoutCalldatas.data)
    const expectedValue = {}

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should handle proposals with unrelated calldatas', async () => {
    const mockDataWithoutCalldatas = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'],
          },
          timeStamp: 1000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue({ data: mockDataWithoutCalldatas })
    mockParseEventLogs.mockReturnValue(mockDataWithoutCalldatas.data)
    const expectedValue = {}

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should return unique proposals sorted by timestamp', async () => {
    const mockData = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}000000000000000000000000${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 3,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 3000,
        },
        {
          args: {
            proposalId: 1,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: [mockData.data[1], mockData.data[3], mockData.data[0]],
    }

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should handle multiple proposals with the same builder', async () => {
    const mockData = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: [mockData.data[1], mockData.data[0]],
    }

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })

  it('should handle multiple builders', async () => {
    const mockData = {
      data: [
        {
          args: {
            proposalId: 1,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_1.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              relayWrapper(
                `${CR_WHITELIST_FUNCTION_SELECTOR}${createPadding(ADDRESS_PADDING_LENGTH)}${builder_2.slice(2)}12345678890098765`,
              ),
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: [mockData.data[0]],
      [builder_2]: [mockData.data[1]],
    }

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })
})
