import { cacheLife } from 'next/cache'
import { NextResponse } from 'next/server'

import { fetchContributors } from '@/app/delegate/actions/delegateAction'
import { Contributor } from '@/app/proposals/shared/types'

function getApiKeyStatus(key: string | undefined): string {
  if (!key) return 'API key is not set'
  if (key.length <= 8) return 'API key appears too short'
  return ''
}

async function getCachedContributors() {
  'use cache'
  cacheLife({ revalidate: 60 })
  const { contributors } = await fetchContributors()
  return contributors.map(({ id, account, createdAt }: Contributor) => ({
    id,
    delegatedVotes: account.delegatedVotes,
    delegators: account.delegators.length,
    votes: account.VoteCasts.length,
    createdAt,
  }))
}

export async function GET() {
  try {
    const mappedContributors = await getCachedContributors()
    return Response.json(mappedContributors)
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const keyStatus = getApiKeyStatus(process.env.DAO_GRAPH_API_KEY)
    const debugInfo = `url: ${process.env.DAO_GRAPH_URL}, id: ${process.env.DAO_GRAPH_ID}${keyStatus ? `, ${keyStatus}` : ''}`
    return NextResponse.json(
      { error: `Cannot fetch contributors: ${message}` },
      {
        status: 500,
        headers: { 'X-Debug-Info': debugInfo },
      },
    )
  }
}
