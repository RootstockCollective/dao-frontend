import { NextResponse } from 'next/server'

import { handleApiError } from '@/app/api/utils/helpers'

import { getCachedEpochHistory } from './action'

export const revalidate = 20

export async function GET() {
  try {
    const { epochs, source } = await getCachedEpochHistory()

    if (epochs.length === 0) {
      return NextResponse.json({ error: 'Cannot fetch epoch history from any source' }, { status: 500 })
    }

    return NextResponse.json(epochs, { headers: { 'X-Source': source! } })
  } catch (error) {
    return handleApiError(error, 'btc vault epoch history route')
  }
}
