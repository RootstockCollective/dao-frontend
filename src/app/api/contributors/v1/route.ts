import { Contributor } from '@/app/proposals/shared/types'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'

export const revalidate = 60

function truncateApiKey(key: string | undefined): string {
  if (!key) return '<not set>'
  if (key.length <= 8) return '<too short>'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
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
    const debugInfo = `[url: ${process.env.DAO_GRAPH_URL}, key: ${truncateApiKey(process.env.DAO_GRAPH_API_KEY)}, id: ${process.env.DAO_GRAPH_ID}]`
    return Response.json({ error: `Cannot fetch contributors: ${message} ${debugInfo}` }, { status: 500 })
  }
}
