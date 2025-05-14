import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Get the origin from the request headers
  const headersList = await headers()
  const origin = headersList.get('origin')

  // Check if the request is from an allowed origin
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL]
  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
  }

  const body = await request.json()

  const response = await fetch(
    `${process.env.THE_GRAPH_URL}/${process.env.THE_GRAPH_API_KEY}/${process.env.THE_GRAPH_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch data from The Graph' }, { status: 500 })
  }

  const data = await response.json()

  // Add security headers to the response
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  })
}

// Handle preflight requests
export async function OPTIONS() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL]

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 })
  }

  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
