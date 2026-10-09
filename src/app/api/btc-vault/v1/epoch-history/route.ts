import { NextResponse } from 'next/server'

import { handleApiError } from '@/app/api/utils/helpers'

import { getCachedEpochHistory } from './action'

export const revalidate = 20

export async function GET() {
  try {
    const { epochs, source, errors } = await getCachedEpochHistory()

    if (epochs.length === 0) {
      return handleApiError(
        new Error('Cannot fetch epoch history from any source'),
        'btc vault epoch history route',
        {
          sourceErrors: errors,
        },
      )
    }

    return NextResponse.json(epochs, { headers: { 'X-Source': source! } })
  } catch (error) {
    return handleApiError(error, 'btc vault epoch history route')
  }
}
