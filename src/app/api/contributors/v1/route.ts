import { handleApiError } from '@/app/api/utils/helpers'
import { fetchContributors } from '@/app/delegate/actions/delegateAction'
import { Contributor } from '@/app/proposals/shared/types'

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
    return handleApiError(error, 'contributors route', { route: '/api/contributors/v1' })
  }
}
