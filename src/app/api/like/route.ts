import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyJWT } from '@/lib/auth/jwt'

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
export async function POST(request: NextRequest) {
  try {
    // Step 1: Extract token from request (header or cookie)
    const token = extractTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authentication token provided' }, { status: 401 })
    }

    // Step 2: Verify JWT token and get user address
    const userAddress = await verifyJWT(token)

    if (!userAddress) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    // Step 3: Parse request body
    const body = await request.json().catch(() => ({}))

    // ============================================
    // PLACEHOLDER: Add your like logic here
    // ============================================
    //
    // At this point, you have:
    // - A validated userAddress (from JWT)
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

    // Step 4: Return success response
    // Modify this response to include your custom data
    return NextResponse.json({
      success: true,
      userAddress,
      // Add your custom response fields here
    })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/like
 *
 * Alternative GET endpoint for checking like status (same validation logic)
 *
 * Query parameters:
 * - proposalId: string (or other identifier)
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Extract token from request (header or cookie)
    const token = extractTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ success: false, error: 'No authentication token provided' }, { status: 401 })
    }

    // Step 2: Verify JWT token and get user address
    const userAddress = await verifyJWT(token)

    if (!userAddress) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    // Step 3: Get query parameters
    const searchParams = request.nextUrl.searchParams
    const proposalId = searchParams.get('proposalId')

    // ============================================
    // PLACEHOLDER: Add your like check logic here
    // ============================================
    //
    // At this point, you have:
    // - A validated userAddress (from JWT)
    // - Query parameters (e.g., proposalId)
    //
    // You can now:
    // - Check if user has liked the item
    // - Get like count for the item
    // - Return like status
    // - etc.
    //
    // Example:
    // if (!proposalId) {
    //   return NextResponse.json(
    //     { success: false, error: 'proposalId is required' },
    //     { status: 400 },
    //   )
    // }
    //
    // const isLiked = await db('ProposalLike')
    //   .where({
    //     proposalId,
    //     userAddress: userAddress.toLowerCase()
    //   })
    //   .first()
    //
    // const likeCount = await db('ProposalLike')
    //   .where({ proposalId })
    //   .count('* as count')
    //   .first()
    //
    // return NextResponse.json({
    //   success: true,
    //   userAddress,
    //   liked: !!isLiked,
    //   likeCount: likeCount?.count || 0,
    // })
    //
    // ============================================

    // Step 4: Return success response
    // Modify this response to include your custom data
    return NextResponse.json({
      success: true,
      userAddress,
      // Add your custom response fields here
    })
  } catch (error) {
    console.error('Like check error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
