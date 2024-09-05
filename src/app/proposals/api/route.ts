import { fetchProposalCreated } from '@/app/user/Balances/actions'

export async function GET() {
  console.log('Fetching proposals...')
  const { data: proposals } = await fetchProposalCreated()
  if (proposals.length === 0) {
    console.warn('No proposals found')
    return new Response('No proposals found', { status: 404 })
  }
  console.log('Proposals found:', proposals.length)
  return Response.json(proposals)
}
