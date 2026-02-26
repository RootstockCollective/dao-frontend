import { fetchAllProposals } from '@/app/proposals/actions/fetchAllProposals'
import { cacheLife } from 'next/cache'
import { NextResponse } from 'next/server'

async function getCachedProposalsData() {
  'use cache'
  cacheLife({ revalidate: 30 })
  return fetchAllProposals()
}

export async function GET() {
  const { proposals, sourceIndex } = await getCachedProposalsData()
  if (proposals.length === 0) {
    return NextResponse.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
  }
  return NextResponse.json(proposals, { headers: { 'X-Source': `source-${sourceIndex}` } })
}
