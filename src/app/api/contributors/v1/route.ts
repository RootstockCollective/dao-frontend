import { Contributor } from '@/app/proposals/shared/types'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'

export const revalidate = 60

function getApiKeyStatus(key: string | undefined): string {
  if (!key) return 'API key is not set'
  if (key.length <= 8) return 'API key appears too short'
  return ''
}

export async function GET() {
  try {
    const { contributors } = await fetchContributors()
    const mappedContributors = contributors.map(({ id, account, createdAt }: Contributor) => {
      return {
        id,
        delegatedVotes: account.delegatedVotes,
        delegators: account.delegators.length,
        votes: account.VoteCasts.length,
        createdAt,
      }
    })
    return Response.json(mappedContributors)
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    const keyStatus = getApiKeyStatus(process.env.DAO_GRAPH_API_KEY)
    const debugInfo = `url: ${process.env.DAO_GRAPH_URL}, id: ${process.env.DAO_GRAPH_ID}${keyStatus ? `, ${keyStatus}` : ''}`
    return Response.json(
      { error: `Cannot fetch contributors: ${message}` },
      {
        status: 500,
        headers: { 'X-Debug-Info': debugInfo },
      },
    )
  }
}
