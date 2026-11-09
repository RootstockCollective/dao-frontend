import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ProposalsFromChain } from './ProposalsFromChain'

const mocks = vi.hoisted(() => ({
  fetchAll: vi.fn(),
  listData: vi.fn(),
}))

vi.mock('./hooks/useFetchLatestProposals', () => ({ useFetchAllProposals: () => mocks.fetchAll() }))
vi.mock('@/app/proposals/hooks/useProposalListData', () => ({
  useProposalListData: () => mocks.listData(),
}))
vi.mock('@/app/proposals/components/LatestProposalsTable', () => ({
  LatestProposalsTableMemoized: () => null,
}))

const listData = (overrides = {}) => ({
  data: [],
  totalProposals: 12,
  activeProposals: 2,
  isStateLoading: false,
  isStateError: false,
  ...overrides,
})

describe('ProposalsFromChain', () => {
  beforeEach(() => {
    mocks.fetchAll.mockReturnValue({ latestProposals: [], isLoading: false, isError: false })
    mocks.listData.mockReturnValue(listData())
  })

  afterEach(cleanup)

  it('reports the on-chain counters once they have loaded', () => {
    const onCountsChange = vi.fn()
    render(<ProposalsFromChain onCountsChange={onCountsChange} />)

    expect(onCountsChange).toHaveBeenLastCalledWith({ total: 12, active: 2 })
  })

  it('reports nothing when the fetch failed, instead of "0 proposals"', () => {
    mocks.fetchAll.mockReturnValue({ latestProposals: [], isLoading: false, isError: true })
    mocks.listData.mockReturnValue(listData({ totalProposals: 0, activeProposals: 0 }))
    const onCountsChange = vi.fn()

    render(<ProposalsFromChain onCountsChange={onCountsChange} />)

    expect(onCountsChange).toHaveBeenLastCalledWith(null)
    expect(onCountsChange).not.toHaveBeenCalledWith(expect.objectContaining({ total: 0 }))
  })

  it('keeps the active counter open while the states are loading or failed', () => {
    for (const overrides of [{ isStateLoading: true }, { isStateError: true }]) {
      mocks.listData.mockReturnValue(listData(overrides))
      const onCountsChange = vi.fn()

      const { unmount } = render(<ProposalsFromChain onCountsChange={onCountsChange} />)

      expect(onCountsChange).toHaveBeenLastCalledWith({ total: 12, active: null })
      unmount()
    }
  })

  it('clears the counters when it unmounts', () => {
    const onCountsChange = vi.fn()
    const { unmount } = render(<ProposalsFromChain onCountsChange={onCountsChange} />)

    unmount()

    expect(onCountsChange).toHaveBeenLastCalledWith(null)
  })
})
