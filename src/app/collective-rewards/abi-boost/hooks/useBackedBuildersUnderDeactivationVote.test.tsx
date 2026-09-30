import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ContextType, ReactNode } from 'react'
import { Address, getAddress, parseEther } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { ProposalState } from '@/shared/types'

import { useBackedBuildersUnderDeactivationVote } from './useBackedBuildersUnderDeactivationVote'

const BACKED = getAddress('0x1111111111111111111111111111111111111111')
const NOT_BACKED = getAddress('0x2222222222222222222222222222222222222222')

const mockBlockNumber = vi.fn<() => bigint | undefined>()
const mockReadContracts = vi.fn()
const mockFetchProposals = vi.fn()

vi.mock('wagmi', async importOriginal => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useBlockNumber: () => ({ data: mockBlockNumber() }),
  useReadContracts: (params: unknown) => mockReadContracts(params),
}))

vi.mock('@/app/proposals/hooks/useGetProposalsWithGraph', () => ({
  PROPOSALS_QUERY_KEY: ['proposals'],
  fetchProposalsFromAPI: () => mockFetchProposals(),
}))

vi.mock('@/app/collective-rewards/user', () => ({
  useBuilderContext: () => ({
    getBuilderByAddress: (address: Address) => (address === BACKED ? { builderName: 'Beexo' } : undefined),
  }),
}))

const deactivation = (proposalId: string, functionName: string, builder: Address, deadline = '1100') => ({
  proposalId,
  proposalDeadline: deadline,
  calldatasParsed: [{ type: 'decoded', functionName, args: [builder], inputs: [] }],
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <AllocationsContext.Provider
      value={
        {
          initialState: { allocations: { [BACKED]: parseEther('150000'), [NOT_BACKED]: 0n } },
        } as unknown as ContextType<typeof AllocationsContext>
      }
    >
      {children}
    </AllocationsContext.Provider>
  </QueryClientProvider>
)

const stateReads = () => {
  const { contracts } = mockReadContracts.mock.lastCall?.[0] as { contracts: { args: [bigint] }[] }
  return contracts.map(({ args }) => args[0])
}

beforeEach(() => {
  mockBlockNumber.mockReturnValue(1000n)
  mockReadContracts.mockReset()
  mockReadContracts.mockReturnValue({ data: [{ status: 'success', result: ProposalState.Active }] })
})

describe('useBackedBuildersUnderDeactivationVote', () => {
  it('warns about a KYC revocation vote against a backed Builder, with the time left', async () => {
    mockFetchProposals.mockResolvedValue([deactivation('7', 'revokeBuilderKYC', BACKED)])
    const { result } = renderHook(() => useBackedBuildersUnderDeactivationVote(), { wrapper })

    await waitFor(() =>
      expect(result.current).toEqual([
        { builder: BACKED, builderName: 'Beexo', proposalId: '7', secondsLeft: 100 * 25 },
      ]),
    )
    expect(stateReads()).toEqual([7n])
  })

  it('reads no proposal state for Builders the wallet does not back', async () => {
    mockFetchProposals.mockResolvedValue([deactivation('8', 'communityBanBuilder', NOT_BACKED)])
    const { result } = renderHook(() => useBackedBuildersUnderDeactivationVote(), { wrapper })

    await waitFor(() => expect(mockFetchProposals).toHaveBeenCalled())
    expect(stateReads()).toEqual([])
    expect(result.current).toEqual([])
  })

  it('drops a vote that is no longer open on-chain', async () => {
    mockFetchProposals.mockResolvedValue([deactivation('9', 'communityBanBuilder', BACKED)])
    mockReadContracts.mockReturnValue({ data: [{ status: 'success', result: ProposalState.Defeated }] })
    const { result } = renderHook(() => useBackedBuildersUnderDeactivationVote(), { wrapper })

    await waitFor(() => expect(stateReads()).toEqual([9n]))
    expect(result.current).toEqual([])
  })

  it('shows nothing until the current block is known', async () => {
    mockBlockNumber.mockReturnValue(undefined)
    mockFetchProposals.mockResolvedValue([deactivation('7', 'revokeBuilderKYC', BACKED)])
    const { result } = renderHook(() => useBackedBuildersUnderDeactivationVote(), { wrapper })

    await waitFor(() => expect(mockFetchProposals).toHaveBeenCalled())
    expect(stateReads()).toEqual([])
    expect(result.current).toEqual([])
  })
})
