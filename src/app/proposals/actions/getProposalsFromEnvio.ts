import { z } from 'zod'
import { ProposalApiResponse } from '@/app/proposals/shared/types'
import { buildProposal } from '@/app/proposals/actions/utils'
import { Address } from 'viem'

// =============================================================================
// Configuration
// =============================================================================

const ENVIO_GRAPHQL_URL = process.env.ENVIO_GRAPHQL_URL
const MIN_PROPOSALS_THRESHOLD = 10

// =============================================================================
// Zod Schemas (Runtime Validation)
// =============================================================================

/**
 * Schema for a single proposal from Envio GraphQL.
 * This is the source of truth for what we expect from Envio.
 */
const EnvioProposalSchema = z.object({
  id: z.string(),
  proposalId: z.string().min(1, 'proposalId is required'),
  proposer: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid proposer address'),
  description: z.string(),
  targets: z.array(z.string()),
  calldatas: z.array(z.string()),
  signatures: z.array(z.string()),
  values: z.array(z.string()),
  voteStart: z.string(),
  voteEnd: z.string(),
  createdAtBlock: z.string(),
  createdAt: z.string(),
  votesFor: z.string(),
  votesAgainst: z.string(),
  votesAbstains: z.string(),
  quorum: z.string(),
  isCanceled: z.boolean(),
  isExecuted: z.boolean(),
  isQueued: z.boolean(),
  etaSeconds: z.string().nullable(),
})

/**
 * Schema for the full Envio GraphQL response.
 */
const EnvioGraphQLResponseSchema = z.object({
  data: z.object({
    Proposal: z.array(EnvioProposalSchema),
  }),
})

// Infer TypeScript type from schema
type EnvioProposal = z.infer<typeof EnvioProposalSchema>

// =============================================================================
// GraphQL Query
// =============================================================================

const ENVIO_PROPOSALS_QUERY = `
  query GetProposals {
    Proposal(order_by: { createdAt: desc }, limit: 1000) {
      id
      proposalId
      proposer
      description
      targets
      calldatas
      signatures
      values
      voteStart
      voteEnd
      createdAtBlock
      createdAt
      votesFor
      votesAgainst
      votesAbstains
      quorum
      isCanceled
      isExecuted
      isQueued
      etaSeconds
    }
  }
`

// =============================================================================
// Adapter: Envio DTO -> Domain Model
// =============================================================================

/**
 * Maps Envio terminal state flags to a state string.
 * Non-terminal states (Active, Pending, etc.) are computed by frontend.
 */
function mapTerminalState(proposal: EnvioProposal): string | null {
  if (proposal.isCanceled) return 'Canceled'
  if (proposal.isExecuted) return 'Executed'
  if (proposal.isQueued) return 'Queued'
  return null
}

/**
 * Transforms a validated Envio proposal to the internal ProposalApiResponse format.
 */
function toProposalApiResponse(proposal: EnvioProposal): ProposalApiResponse {
  return buildProposal(
    {
      proposalId: proposal.proposalId,
      description: proposal.description,
      votesFor: proposal.votesFor,
      votesAgainst: proposal.votesAgainst,
      votesAbstains: proposal.votesAbstains,
      voteEnd: proposal.voteEnd,
      voteStart: proposal.voteStart,
      createdAt: proposal.createdAt,
      createdAtBlock: proposal.createdAtBlock,
      state: mapTerminalState(proposal),
      targets: proposal.targets,
      values: proposal.values,
      calldatas: proposal.calldatas,
      proposer: proposal.proposer as Address,
      quorum: proposal.quorum,
    },
    {
      parseTargets: targets => targets,
      parseCalldatas: calldatas => calldatas,
      proposerTransform: proposer => proposer as Address,
    },
  )
}

// =============================================================================
// Fetcher
// =============================================================================

/**
 * Fetches proposals from Envio GraphQL endpoint.
 *
 * Features:
 * - Runtime validation with Zod schemas
 * - Clear error messages with validation details
 * - Adapter pattern for DTO -> domain transformation
 *
 * @throws Error if Envio URL not configured
 * @throws Error if fetch fails
 * @throws Error if response fails schema validation
 * @throws Error if insufficient proposals returned
 */
export async function getProposalsFromEnvio(): Promise<ProposalApiResponse[]> {
  // Check configuration
  if (!ENVIO_GRAPHQL_URL) {
    throw new Error('Envio: ENVIO_GRAPHQL_URL environment variable not configured')
  }

  // Fetch from Envio
  const response = await fetch(ENVIO_GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: ENVIO_PROPOSALS_QUERY }),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    throw new Error(`Envio: HTTP ${response.status} - ${response.statusText}`)
  }

  const json: unknown = await response.json()

  // Validate response structure with Zod
  const parseResult = EnvioGraphQLResponseSchema.safeParse(json)

  if (!parseResult.success) {
    // Format Zod errors for clarity
    const issues = parseResult.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Envio: Invalid response structure - ${issues}`)
  }

  const { data } = parseResult.data
  const proposals = data.Proposal

  // Business validation: minimum proposals threshold
  if (proposals.length < MIN_PROPOSALS_THRESHOLD) {
    throw new Error(
      `Envio: Insufficient proposals - expected at least ${MIN_PROPOSALS_THRESHOLD}, got ${proposals.length}`,
    )
  }

  // Transform validated DTOs to domain models
  return proposals.map(toProposalApiResponse)
}
