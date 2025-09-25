import { Contributor } from '@/app/proposals/shared/types'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'

export const revalidate = 60

export async function GET() {
  try {
    const { contributors } = await fetchContributors()
    const proposals = contributors.map(({ id, account, createdAt }: Contributor) => {
      return {
        id,
        delegatedVotes: account.delegatedVotes,
        delegators: account.delegators.length,
        votes: account.VoteCasts.length,
        createdAt,
      }
    })
    return Response.json(proposals)
  } catch (error) {
    console.error(error)
  }
  return Response.json({ error: 'Can not fetch contributors' }, { status: 500 })
}
