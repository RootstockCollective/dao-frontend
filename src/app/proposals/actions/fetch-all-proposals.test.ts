import type { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProposalGraphQLResponse } from '@/app/proposals/actions/proposals-action'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { ProposalCategory } from '@/shared/types/types'

import { fetchAllProposals } from './fetch-all-proposals'
import * as validateSourceSync from './validate-source-sync'

const hoisted = vi.hoisted(() => ({
  dbMock: vi.fn(),
  getBlockNumberMock: vi.fn(),
  fetchProposalsMock: vi.fn(),
  getProposalsFromEnvio: vi.fn(),
  getProposalsFromTheGraph: vi.fn(),
  getProposalsFromBlockscoutUncached: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}))

vi.mock('@/lib/db', () => ({
  db: hoisted.dbMock,
}))

vi.mock('wagmi/actions', () => ({
  getBlockNumber: hoisted.getBlockNumberMock,
}))

vi.mock('@/app/proposals/actions/proposals-action', () => ({
  fetchProposals: hoisted.fetchProposalsMock,
}))

vi.mock('./get-proposals-from-envio', () => ({
  getProposalsFromEnvio: hoisted.getProposalsFromEnvio,
}))

vi.mock('./get-proposals-from-the-graph', () => ({
  getProposalsFromTheGraph: hoisted.getProposalsFromTheGraph,
}))

vi.mock('./get-proposals-from-blockscout', () => ({
  getProposalsFromBlockscoutUncached: hoisted.getProposalsFromBlockscoutUncached,
}))

function makeDbProposalRow(i: number) {
  return {
    proposalId: String(i),
    description: 'test',
    votesFor: '0',
    votesAgainst: '0',
    votesAbstains: '0',
    voteEnd: '100',
    voteStart: '50',
    quorum: '0',
    rawState: 0,
    state: 'Active',
    proposer: '0x1111111111111111111111111111111111111111' as Address,
    calldatas: ['0x00'],
    values: ['0'],
    createdAtBlock: '1',
    targets: ['0x2222222222222222222222222222222222222222'],
    createdAt: new Date().toISOString(),
  }
}

function makeGraphProposal(i: number): ProposalGraphQLResponse {
  return {
    id: String(i),
    proposalId: String(i),
    proposer: { id: '0x1111111111111111111111111111111111111111' },
    targets: ['0x2222222222222222222222222222222222222222'],
    description: 'test',
    votesFor: '0',
    votesAgainst: '0',
    votesAbstains: '0',
    voteEnd: '100',
    voteStart: '50',
    quorum: '0',
    createdAt: new Date().toISOString(),
    createdAtBlock: '1',
    signatures: [],
    values: ['0'],
    calldatas: ['0x'],
    state: 'Active',
    rawState: 0,
  }
}

const blockscoutStub: ProposalApiResponse = {
  blockNumber: '1',
  calldatasParsed: [],
  category: ProposalCategory.Grants,
  description: 'x',
  name: 'n',
  proposalDeadline: '1',
  proposalId: '99',
  proposer: '0x1111111111111111111111111111111111111111',
  Starts: new Date().toISOString(),
  voteStart: '1',
  voteEnd: '100',
  votingPeriod: '99',
  votes: { againstVotes: '0', forVotes: '0', abstainVotes: '0' },
}

function setupDbMocks(options: { metadataBlock: string; proposalRows: ReturnType<typeof makeDbProposalRow>[] }) {
  const proposalChain = {
    select: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(options.proposalRows),
  }
  const metaChain = {
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue({ id: 'governance', blockNumber: options.metadataBlock }),
  }

  hoisted.dbMock.mockImplementation((table: string) => {
    if (table === 'SubgraphMetadata') return metaChain
    if (table === 'Proposal') return proposalChain
    throw new Error(`Unexpected table: ${table}`)
  })

  Object.assign(hoisted.dbMock, { raw: vi.fn((sql: string) => sql) })
}

describe('fetchAllProposals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hoisted.dbMock.mockReset()
    hoisted.getProposalsFromEnvio.mockRejectedValue(new Error('Envio unavailable'))
    hoisted.getProposalsFromTheGraph.mockResolvedValue([])
    hoisted.getProposalsFromBlockscoutUncached.mockResolvedValue([blockscoutStub])
    hoisted.getBlockNumberMock.mockResolvedValue(1000n)
    hoisted.fetchProposalsMock.mockReset()
  })

  it.skip('runs validateDBSync when falling back to the database after Envio fails', async () => {
    const rows = Array.from({ length: 10 }, (_, i) => makeDbProposalRow(i))
    setupDbMocks({ metadataBlock: '995', proposalRows: rows })

    const validateSpy = vi.spyOn(validateSourceSync, 'validateDBSync')

    const result = await fetchAllProposals()

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(result.sourceIndex).toBe(1)
    expect(result.proposals.length).toBe(10)
    expect(hoisted.getProposalsFromTheGraph).not.toHaveBeenCalled()

    validateSpy.mockRestore()
  })

  it.skip('continues to The Graph when validateDBSync rejects stale SubgraphMetadata', async () => {
    setupDbMocks({ metadataBlock: '1', proposalRows: [] })

    const validateSpy = vi.spyOn(validateSourceSync, 'validateDBSync')

    await fetchAllProposals()

    expect(validateSpy).toHaveBeenCalled()
    expect(hoisted.getProposalsFromTheGraph).toHaveBeenCalled()

    validateSpy.mockRestore()
  })

  it.skip('continues past The Graph when _meta block is too far behind chain head', async () => {
    setupDbMocks({ metadataBlock: '1', proposalRows: [] })

    hoisted.fetchProposalsMock.mockResolvedValue({
      _meta: { block: { number: 1 } },
      proposals: Array.from({ length: 10 }, (_, i) => makeGraphProposal(i)),
      counters: [],
    })

    const actualGraph = await vi.importActual<typeof import('./get-proposals-from-the-graph')>(
      './get-proposals-from-the-graph',
    )
    hoisted.getProposalsFromTheGraph.mockImplementation(actualGraph.getProposalsFromTheGraph)

    hoisted.getBlockNumberMock.mockResolvedValue(5000n)

    const result = await fetchAllProposals()

    expect(hoisted.getProposalsFromTheGraph).toHaveBeenCalled()
    expect(hoisted.getProposalsFromBlockscoutUncached).toHaveBeenCalled()
    expect(result.sourceIndex).toBe(3)
    expect(result.proposals).toEqual([blockscoutStub])
  })
})
