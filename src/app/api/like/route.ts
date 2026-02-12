import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'
import { daoDataDb } from '@/lib/daoDataDb'
import { confirmProposalExists } from '@/app/proposals/actions/getProposalById'

const TABLE = 'dao_data.ProposalLikes'

const ProposalIdSchema = z
  .string()
  .min(1, 'proposalId is required')
  .refine(val => {
    try {
      BigInt(val)
      return true
    } catch {
      return false
    }
  }, 'proposalId must be a valid numeric string')

const LikeRequestSchema = z.object({
  proposalId: ProposalIdSchema,
  reaction: z.enum(['heart']).default('heart'),
})

function bigIntToBuffer(value: string): Buffer {
  let hex = BigInt(value).toString(16)
  hex = hex.padStart(64, '0')
  return Buffer.from(hex, 'hex')
}

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
  if (!daoDataDb) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  const proposalId = request.nextUrl.searchParams.get('proposalId') ?? ''
  const parsed = ProposalIdSchema.safeParse(proposalId)

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const proposalIdBuffer = bigIntToBuffer(parsed.data)

  try {
    const rows: { reaction: string; count: number }[] = await daoDataDb(TABLE)
      .where({ proposalId: proposalIdBuffer })
      .groupBy('reaction')
      .select('reaction')
      .count('* as count')

    const reactions: Record<string, number> = {}
    for (const row of rows) {
      reactions[row.reaction] = Number(row.count)
    }

    return NextResponse.json({ success: true, proposalId: parsed.data, reactions })
  } catch (error) {
    console.error('Error in GET /api/like:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(async (request, session: JWTPayload) => {
  if (!daoDataDb) {
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

  const proposalExists = await confirmProposalExists(proposalId)
  if (!proposalExists) {
    return Response.json({ success: false, error: 'Proposal not found in the Governor' }, { status: 404 })
  }

  const userAddress = session.userAddress.toLowerCase()
  const proposalIdBuffer = bigIntToBuffer(proposalId)

  try {
    const liked = await daoDataDb.transaction(async trx => {
      const existing = await trx(TABLE).where({ proposalId: proposalIdBuffer, userAddress, reaction }).first()

      if (existing) {
        await trx(TABLE).where({ id: existing.id }).delete()
        return false
      }

      await trx(TABLE).insert({
        proposalId: proposalIdBuffer,
        userAddress,
        reaction,
      })
      return true
    })

    return Response.json({ success: true, liked, reaction })
  } catch (error) {
    console.error('Error in POST /api/like:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
})
