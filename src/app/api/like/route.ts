import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'
import { daoDataDb } from '@/lib/daoDataDb'
import { confirmProposalExists } from '@/app/proposals/actions/getProposalById'

const TABLE = 'dao_data.ProposalLikes'

const LikeRequestSchema = z.object({
  proposalId: z
    .string()
    .min(1, 'proposalId is required')
    .refine(val => {
      try {
        BigInt(val)
        return true
      } catch {
        return false
      }
    }, 'proposalId must be a valid numeric string'),
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
