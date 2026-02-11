import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'
import { daoDataDb } from '@/lib/daoDataDb'
import { bigIntToBuffer } from '@/app/api/utils/proposalId'

const LikeBodySchema = z.object({
  proposalId: z
    .string()
    .min(1)
    .refine(val => {
      try {
        BigInt(val)
        return true
      } catch {
        return false
      }
    }, 'Invalid proposalId'),
  reaction: z.enum(['heart']).default('heart'),
})

/**
 * POST /api/like
 *
 * Toggle proposal reaction (add or remove). Requires JWT authentication.
 *
 * Request:
 * - Token via Authorization header (`Bearer <token>`) or cookie (`auth-token`)
 * - Body: { proposalId: string, reaction?: 'heart' }
 *
 * Response (success):
 * { success: true, liked: boolean, userAddress: string }
 *
 * Response (error):
 * { success: false, error: string }
 */
export const POST = withAuth(async (request: NextRequest, session: JWTPayload) => {
  const { userAddress } = session
  const normalizedAddress = userAddress.toLowerCase()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ success: false, error: 'Request body must be an object' }, { status: 400 })
  }

  const parseResult = LikeBodySchema.safeParse(body)
  if (!parseResult.success) {
    const firstError =
      parseResult.error.errors[0]?.message ??
      parseResult.error.flatten().formErrors[0] ??
      'Invalid request body'
    return NextResponse.json({ success: false, error: firstError }, { status: 400 })
  }

  const { proposalId, reaction } = parseResult.data

  if (!daoDataDb) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const proposalIdBuffer = bigIntToBuffer(proposalId)

    const result = await daoDataDb.transaction(async trx => {
      const existing = await trx('ProposalLikes')
        .withSchema('dao_data')
        .where({
          proposalId: proposalIdBuffer,
          userAddress: normalizedAddress,
          reaction,
        })
        .first()

      if (existing) {
        await trx('ProposalLikes')
          .withSchema('dao_data')
          .where({
            proposalId: proposalIdBuffer,
            userAddress: normalizedAddress,
            reaction,
          })
          .delete()
        return { liked: false }
      }

      await trx('ProposalLikes').withSchema('dao_data').insert({
        proposalId: proposalIdBuffer,
        userAddress: normalizedAddress,
        reaction,
      })
      return { liked: true }
    })

    return NextResponse.json({
      success: true,
      liked: result.liked,
      userAddress: normalizedAddress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const response: { success: false; error: string; message?: string } = {
      success: false,
      error: 'Internal server error',
    }
    if (process.env.NODE_ENV !== 'production') {
      response.message = message
    }
    return NextResponse.json(response, { status: 500 })
  }
})
