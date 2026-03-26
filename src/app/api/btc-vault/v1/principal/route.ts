import { NextRequest, NextResponse } from 'next/server'

import { handleApiError, queryParam } from '@/app/api/utils/helpers'
import { AddressSchema } from '@/app/api/utils/validators'

import { fetchUserPrincipal } from './action'

export const revalidate = 20

/**
 * GET /api/btc-vault/v1/principal?address=0x...
 * Returns the net principal deposited by the user (sum of deposits minus withdrawals).
 * Response: { principal: string } where principal is wei as a decimal string.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams
    const rawAddress = queryParam(searchParams)('address')

    const address = AddressSchema.parse(rawAddress)

    const { principal, events, source } = await fetchUserPrincipal(address)

    return NextResponse.json({ principal: principal.toString(), events }, { headers: { 'X-Source': source } })
  } catch (error) {
    return handleApiError(error, 'btc vault principal route')
  }
}
