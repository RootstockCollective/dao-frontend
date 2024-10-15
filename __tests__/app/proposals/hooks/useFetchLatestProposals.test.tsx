import {
  ProposalQueryResult,
  useFetchCreateBuilderProposals,
} from '@/app/proposals/hooks/useFetchLatestProposals'
import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { expect } from '@jest/globals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { Interface } from 'ethers/abi'
import { getAddress, parseEventLogs } from 'viem'
import { ADDRESS_PADDED_BYTES } from '@/app/proposals/shared/utils'

jest.mock('@/app/user/Balances/actions', () => ({
  fetchProposalsCreatedCached: jest.fn(),
}))

jest.mock('viem', () => ({
  parseEventLogs: jest.fn(),
  getAddress: jest.fn().mockImplementation((address: string) => address),
}))

const BIM_WHITELIST_FUNCTION = 'whitelistBuilder' // TODO: refactor
const BIM_WHITELIST_FUNCTION_SELECTOR = new Interface(SimplifiedRewardDistributorAbi).getFunction(
  BIM_WHITELIST_FUNCTION,
)?.selector

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

const mocFetchProposalsCreatedCached = fetchProposalsCreatedCached as jest.Mock
const mockParseEventLogs = parseEventLogs as jest.Mock

describe('useFetchCreateBuilderProposals', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
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
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 2000,
        },
      ],
    }

    const expectedValue = {
      [builder_1]: {
        [mockProposalData.data[0].args.proposalId.toString()]: mockProposalData.data[0],
      },
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
              `${BIM_WHITELIST_FUNCTION_SELECTOR}000000000000000000000000${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 3,
            calldatas: [
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 3000,
        },
        {
          args: {
            proposalId: 1,
            calldatas: [
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: {
        [mockData.data[0].args.proposalId.toString()]: mockData.data[0],
        [mockData.data[1].args.proposalId.toString()]: mockData.data[1],
        [mockData.data[3].args.proposalId.toString()]: mockData.data[3], // a Record does not preserve order so we can not guarantee the order of the proposals unless we use a Map.
      },
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
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: {
        [mockData.data[0].args.proposalId.toString()]: mockData.data[0],
        [mockData.data[1].args.proposalId.toString()]: mockData.data[1],
      },
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
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_1.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 1500,
        },
        {
          args: {
            proposalId: 2,
            calldatas: [
              `${BIM_WHITELIST_FUNCTION_SELECTOR}${ADDRESS_PADDED_BYTES}${builder_2.slice(2)}12345678890098765`,
            ],
          },
          timeStamp: 2000,
        },
      ],
    }
    mocFetchProposalsCreatedCached.mockReturnValue(mockData)
    mockParseEventLogs.mockReturnValue(mockData.data)

    const expectedValue = {
      [builder_1]: {
        [mockData.data[0].args.proposalId.toString()]: mockData.data[0],
      },
      [builder_2]: {
        [mockData.data[1].args.proposalId.toString()]: mockData.data[1],
      },
    }

    let actualValue = await renderAndWaitForHook(() => useFetchCreateBuilderProposals())

    expect(actualValue).toEqual(expectedValue)
  })
})
