import { NextResponse } from 'next/server'
import { type Address, isAddress } from 'viem'

/** Upper bound on `gauges` per request; the mainnet set is well under it. */
export const MAX_GAUGES_PER_REQUEST = 200

/**
 * Reads the comma-separated `gauges` query param shared by the `/api/gauges/<event>` routes.
 *
 * @returns The gauges as the caller spelled them — the routes key their responses by these
 *   strings, so they are not normalised here — or the 400 response to send instead.
 */
export function parseGaugesParam(req: Request): { gauges: Address[] } | { error: NextResponse } {
  const gauges = (new URL(req.url).searchParams.get('gauges') ?? '')
    .split(',')
    .map(g => g.trim())
    .filter(Boolean) as Address[]

  if (gauges.length === 0) {
    return { error: NextResponse.json({ error: 'Missing required `gauges` query param' }, { status: 400 }) }
  }
  if (gauges.length > MAX_GAUGES_PER_REQUEST) {
    return {
      error: NextResponse.json(
        { error: `Too many gauges; max ${MAX_GAUGES_PER_REQUEST} per request` },
        { status: 400 },
      ),
    }
  }
  if (!gauges.every(g => isAddress(g))) {
    return { error: NextResponse.json({ error: 'Invalid gauge address in `gauges`' }, { status: 400 }) }
  }

  return { gauges }
}
