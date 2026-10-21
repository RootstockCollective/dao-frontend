import { handleApiError } from '@/app/api/utils/helpers'
import { fetchTotalDelegatedVotes } from '@/app/delegate/actions/delegateAction'
import { DelegatedVotesApiResponse } from '@/app/proposals/shared/types'

export const revalidate = 60

export async function GET() {
  try {
    const totalDelegatedVotes = await fetchTotalDelegatedVotes()
    const body: DelegatedVotesApiResponse = { totalDelegatedVotes: totalDelegatedVotes.toString() }
    return Response.json(body)
  } catch (error) {
    return handleApiError(error, 'delegated votes route', { route: '/api/delegated-votes/v1' })
  }
}
