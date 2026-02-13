import { NextResponse } from 'next/server'
import { JWTPayload } from '@/lib/auth/jwt'
import { withAuth } from '@/lib/auth/withAuth'

/**
 * POST /api/like
 *
 * Validates JWT token and provides a protected endpoint for like functionality.
 *
 * Request:
 * - Token can be sent via:
 *   1. Authorization header: `Authorization: Bearer <token>`
 *   2. Cookie: `auth-token=<token>`
 * - Body should contain like-related data (e.g., proposalId, itemId, etc.)
 *
 * Request body example:
 * {
 *   proposalId: string,
 *   // Add other fields as needed
 * }
 *
 * Response (success):
 * {
 *   success: true,
 *   userAddress: string,
 *   // Add your custom response data here
 * }
 *
 * Response (error):
 * {
 *   success: false,
 *   error: string
 * }
 */
export const POST = withAuth(async (_request, session: JWTPayload) => {
  const { userAddress } = session

  // Parse request body
  const body = await _request.json().catch(() => ({}))

  // ============================================
  // PLACEHOLDER: Add your like logic here
  // ============================================
  //
  // At this point, you have:
  // - A validated session with userAddress (and future fields)
  // - Request body data (e.g., proposalId, itemId, etc.)
  //
  // You can now:
  // - Check if user already liked the item
  // - Insert/update like in database
  // - Return like count or status
  // - etc.
  //
  // Example:
  // const { proposalId } = body
  // if (!proposalId) {
  //   return NextResponse.json(
  //     { success: false, error: 'proposalId is required' },
  //     { status: 400 },
  //   )
  // }
  //
  // // Check if already liked
  // const existingLike = await db('ProposalLike')
  //   .where({ proposalId, userAddress: userAddress.toLowerCase() })
  //   .first()
  //
  // if (existingLike) {
  //   // Unlike: delete the like
  //   await db('ProposalLike').where({ id: existingLike.id }).delete()
  //   return NextResponse.json({ success: true, liked: false, userAddress })
  // } else {
  //   // Like: insert new like
  //   await db('ProposalLike').insert({
  //     proposalId,
  //     userAddress: userAddress.toLowerCase(),
  //     createdAt: new Date(),
  //   })
  //   return NextResponse.json({ success: true, liked: true, userAddress })
  // }
  //
  // ============================================

  // Return success response
  // Modify this response to include your custom data
  return NextResponse.json({
    success: true,
    userAddress,
    body,
    tester: 1,
    session,
  })
})
