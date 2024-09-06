import { fetchProposalCreated } from '@/app/user/Balances/actions'

export async function GET() {
  console.log('Fetching proposals...')
  const { data: proposals } = await fetchProposalCreated()
  if (proposals.length === 0) {
    // when proposals is empty, that's because blockscout is down, return 404 to trigger the retry
    console.warn('No proposals found')
    return new Response('No proposals found', { status: 404 })
  }
  console.log('Proposals found:', proposals.length)
  return Response.json(proposals)
}
