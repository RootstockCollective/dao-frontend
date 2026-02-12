import { fetchAllProposals } from '@/app/proposals/actions/fetchAllProposals'

export const revalidate = 30

export async function GET() {
  const { proposals, sourceIndex } = await fetchAllProposals()
  if (proposals.length === 0) {
    return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
  }
  return Response.json(proposals, { headers: { 'X-Source': `source-${sourceIndex}` } })
}
