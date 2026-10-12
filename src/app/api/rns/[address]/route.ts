import { NextRequest, NextResponse } from 'next/server'

import { handleApiError } from '@/app/api/utils/helpers'
import { AddressSchema } from '@/app/api/utils/validators'
import { buildBlockscoutRestRequest } from '@/lib/blockscout/blockscout-api'

/**
 * Domain lookups are close to immutable and shared by every visitor, so a long window costs one
 * upstream call per address per hour instead of one per browser per 30 seconds.
 */
export const revalidate = 3600

interface BlockscoutAddressResponse {
  ens_domain_name?: string | null
}

/**
 * GET `/api/rns/:address` — resolves an address to its RNS/ENS domain name.
 *
 * @remarks
 * This exists because the browser cannot call Blockscout directly any more. The per-instance API
 * is deprecated and its public endpoint rate-limits to roughly 10 requests per 16-minute window per
 * IP; the replacement PRO API needs an API key, and a key reachable from the browser is a leaked
 * key. So the call is made here, server-side, where `BLOCKSCOUT_API_KEY` stays private.
 *
 * Caching it centrally is a bonus rather than the motive: `getEnsDomainName` still keeps its
 * 30-second `localStorage` entry per visitor, but that cache is per browser and shares nothing.
 *
 * @returns `{ ens_domain_name: string | null }`. A missing name is `null`, not an error — an
 *   address with no domain is the normal case, and the caller renders the raw address for it.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> },
): Promise<Response> {
  const { address } = await params

  const parsed = AddressSchema.safeParse(address)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const { url, headers } = buildBlockscoutRestRequest(`addresses/${parsed.data}`)
    const response = await fetch(url, { headers, next: { revalidate } })

    // Blockscout answers 404 for an address it has never seen, which is not an error for us.
    if (response.status === 404) {
      return NextResponse.json({ ens_domain_name: null })
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to resolve domain name' },
        // Pass the upstream's own retryability through instead of flattening it to a 500.
        { status: response.status === 429 ? 503 : 502, headers: { 'Retry-After': '5' } },
      )
    }

    const data = (await response.json()) as BlockscoutAddressResponse
    return NextResponse.json({ ens_domain_name: data?.ens_domain_name ?? null })
  } catch (err) {
    return handleApiError(err, 'rns address resolution')
  }
}
