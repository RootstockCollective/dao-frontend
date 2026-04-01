import { connection, NextRequest } from 'next/server'

import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'
import { prisma } from '@/lib/prisma'

import { bigIntToBuffer, ProposalIdSchema } from '../shared'

/**
 * GET /api/like/user?proposalId=<BigInt string>
 *
 * Returns the authenticated user's reactions for a given proposal.
 *
 * Response (success):
 * { success: true, proposalId: string, reactions: string[] }
 */
export const GET = withAuth(async (request: NextRequest, session: JWTPayload) => {
  await connection()
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

  const userAddress = session.userAddress.toLowerCase()
  const proposalIdBuffer = bigIntToBuffer(parsed.data)

  try {
    const rows = await prisma.proposalLike.findMany({
      where: { proposalId: proposalIdBuffer, userAddress },
      select: { reaction: true },
    })

    const reactions = rows.map(row => row.reaction)

    return Response.json({ success: true, proposalId: parsed.data, reactions })
  } catch (error) {
    console.error('Error in GET /api/like/user:', error)
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
})
