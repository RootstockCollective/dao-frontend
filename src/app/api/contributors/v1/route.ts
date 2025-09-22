import { Contributor } from '@/app/proposals/shared/types'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'

export const revalidate = 60

export async function GET() {
  const { contributors } = await fetchContributors()
  return Response.json(
    contributors.map(({ id, account, createdAt }: Contributor) => {
      return {
        id,
        delegatedVotes: account.delegatedVotes,
        delegators: account.delegators.length,
        votes: account.VoteCasts.length,
        createdAt,
      }
    }),
  )
}
