import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'

/**
 * Builder profiles are curated by the team and change rarely, so the response is
 * cached for 5 minutes rather than hit on every page load.
 */
export const revalidate = 300

export interface BuilderProfileData {
  image: string | null
}

export interface BuilderProfilesResponse {
  success: boolean
  profiles: Record<string, BuilderProfileData>
}

/**
 * GET /api/builder-profiles
 *
 * Returns the curated, app-owned configuration for every builder, keyed by
 * lowercased builder address. Public endpoint — no authentication required.
 *
 * The on-chain builder list lives in the indexer database and is read client-side
 * by `useGetBuilders`; the two are merged in `BuilderContext`. They cannot be
 * joined in SQL because they are separate connections (see `@/lib/db` vs `@/lib/prisma`).
 *
 * Response (success):
 * { success: true, profiles: { "0x…": { image: string | null } } }
 *
 * When the database is not configured the endpoint returns an empty map rather
 * than an error, so builders simply fall back to their generated identicon.
 */
export async function GET() {
  if (!prisma) {
    return Response.json({ success: true, profiles: {} } satisfies BuilderProfilesResponse)
  }

  try {
    const rows = await prisma.builderProfile.findMany({
      select: { address: true, image: true },
    })

    const profiles = rows.reduce<Record<string, BuilderProfileData>>((acc, { address, image }) => {
      acc[address.toLowerCase()] = { image }
      return acc
    }, {})

    return Response.json({ success: true, profiles } satisfies BuilderProfilesResponse)
  } catch (error) {
    logger.error({ err: error, route: '/api/builder-profiles' }, 'Error in GET /api/builder-profiles')
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
