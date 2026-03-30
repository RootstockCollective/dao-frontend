import { NextResponse } from 'next/server'

import { getCachedEpochHistory } from './action'

export async function GET() {
  try {
    const { epochs, source, errors } = await getCachedEpochHistory()

    const headers: Record<string, string> = {}

    if (errors.length > 0) {
      headers['X-Source-Errors'] = errors.map(e => `${e.source}: ${e.message}`).join('; ')
    }

    if (epochs.length === 0) {
      return NextResponse.json(
        { error: 'Cannot fetch epoch history from any source' },
        {
          status: 500,
          headers,
        },
      )
    }

    headers['X-Source'] = source!
    return NextResponse.json(epochs, { headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: 'Failed to fetch epoch history' },
      {
        status: 500,
        headers: { 'X-Source-Errors': `unexpected: ${message}` },
      },
    )
  }
}
