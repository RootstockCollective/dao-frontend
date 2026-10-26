import { print } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock('@/shared/components/ApolloClient', () => ({
  daoClient: { query: mocks.query },
}))

import { fetchContributors, fetchTotalDelegatedVotes } from './delegateAction'

const account = (i: number, delegatedVotes: string) => ({
  id: `0x${i.toString(16).padStart(40, '0')}`,
  delegatedVotes,
})

describe('fetchContributors', () => {
  beforeEach(() => mocks.query.mockReset())

  it('asks for up to 1000 votes and delegators, so the counts are not capped at the default 100', async () => {
    mocks.query.mockResolvedValue({ data: { contributors: [] } })

    await fetchContributors()

    const query = print(mocks.query.mock.calls[0][0].query)
    expect(query).toMatch(/delegators\(first: 1000\)/)
    expect(query).toMatch(/VoteCasts\(first: 1000\)/)
  })
})

describe('fetchTotalDelegatedVotes', () => {
  beforeEach(() => mocks.query.mockReset())

  it('sums the delegated votes of every account', async () => {
    mocks.query.mockResolvedValue({
      data: { accounts: [account(1, '1000'), account(2, '250'), account(3, '1')] },
    })

    expect(await fetchTotalDelegatedVotes()).toBe(1251n)
    expect(mocks.query).toHaveBeenCalledTimes(1)
    expect(mocks.query.mock.calls[0][0].variables).toEqual({ first: 1000, after: '' })
  })

  it('pages by id cursor when there are more than 1000 delegated accounts', async () => {
    const firstPage = Array.from({ length: 1000 }, (_, i) => account(i + 1, '2'))
    mocks.query
      .mockResolvedValueOnce({ data: { accounts: firstPage } })
      .mockResolvedValueOnce({ data: { accounts: [account(1001, '5')] } })

    expect(await fetchTotalDelegatedVotes()).toBe(2005n)
    expect(mocks.query).toHaveBeenCalledTimes(2)
    expect(mocks.query.mock.calls[1][0].variables).toEqual({ first: 1000, after: firstPage[999].id })
  })

  it('does not report zero when the subgraph returns no data', async () => {
    mocks.query.mockResolvedValue({ data: undefined })

    await expect(fetchTotalDelegatedVotes()).rejects.toThrow('Failed to fetch delegated votes from subgraph')
  })
})
