import { Contributor } from '@/app/proposals/shared/types'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'

export const revalidate = 60

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
    return Response.json({ error: `Cannot fetch contributors: ${message}` }, { status: 500 })
  }
}
