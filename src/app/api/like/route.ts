import { NextRequest } from 'next/server'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'
import { prisma } from '@/lib/prisma'
import { confirmProposalExists } from '@/app/proposals/actions/getProposalById'
import { ENV } from '@/lib/constants'
import { ProposalIdSchema, bigIntToBuffer } from './shared'

const LikeRequestSchema = z.object({
  proposalId: ProposalIdSchema,
  reaction: z.enum(['heart']).default('heart'),
})

/**
 * POST /api/like
 *
 * Toggles a proposal reaction for the authenticated user.
 * If the reaction exists, it is removed. If it does not exist, it is added.
 *
 * Request body:
 * {
 *   proposalId: string  — numeric string representing the proposal ID
 *   reaction?: string   — reaction type (default: "heart")
 * }
 *
 * Response (success):
 * { success: true, liked: boolean }
 *
 * Response (error):
 * { success: false, error: string, details?: object }
 */
/**
 * GET /api/like?proposalId=<BigInt string>
 *
 * Returns aggregated reaction counts for a given proposal.
 * Public endpoint — no authentication required.
 *
 * Response (success):
 * { success: true, proposalId: string, reactions: Record<string, number> }
 */
export async function GET(request: NextRequest) {
  if (!prisma) {
    return Response.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  const proposalId = request.nextUrl.searchParams.get('proposalId') ?? ''
  const parsed = ProposalIdSchema.safeParse(proposalId)

  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const proposalIdBuffer = bigIntToBuffer(parsed.data)

  try {
    const rows = await prisma.proposalLike.groupBy({
      by: ['reaction'],
      where: { proposalId: proposalIdBuffer },
      _count: { _all: true },
    })

    const reactions: Record<string, number> = {}
    for (const row of rows) {
      reactions[row.reaction] = row._count._all
    }

    return Response.json({ success: true, proposalId: parsed.data, reactions })
  } catch (error) {
    console.error('Error in GET /api/like:', error)
    // @TODO Remove debug header once the like/reaction flow is fully completed
    const headers: HeadersInit = {}
    if (ENV !== 'mainnet' && request.nextUrl.searchParams.get('debug') === '1') {
      headers['X-Debug-Error'] = error instanceof Error ? error.message : String(error)
    }
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers })
  }
}

export const POST = withAuth(async (request, session: JWTPayload) => {
  if (!prisma) {
    return Response.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const parsed = LikeRequestSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { proposalId, reaction } = parsed.data
  const userAddress = session.userAddress.toLowerCase()
  const proposalIdBuffer = bigIntToBuffer(proposalId)

  try {
    const proposalExists = await confirmProposalExists(proposalId)
    if (!proposalExists) {
      return Response.json({ success: false, error: 'Proposal not found in the Governor' }, { status: 404 })
    }

    const liked = await prisma.$transaction(async tx => {
      const existing = await tx.proposalLike.findFirst({
        where: { proposalId: proposalIdBuffer, userAddress, reaction },
      })

      if (existing) {
        await tx.proposalLike.delete({ where: { id: existing.id } })
        return false
      }

      await tx.proposalLike.create({
        data: { proposalId: proposalIdBuffer, userAddress, reaction },
      })
      return true
    })

    return Response.json({ success: true, liked, reaction })
  } catch (error) {
    console.error('Error in POST /api/like:', error)
    // @TODO Remove debug header once the like/reaction flow is fully completed
    const headers: HeadersInit = {}
    if (ENV !== 'mainnet' && request.nextUrl.searchParams.get('debug') === '1') {
      headers['X-Debug-Error'] = error instanceof Error ? error.message : String(error)
    }
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500, headers })
  }
})
