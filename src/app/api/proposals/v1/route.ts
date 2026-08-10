import { fetchAllProposals } from '@/app/proposals/actions/fetch-all-proposals'

export const revalidate = 30

export async function GET() {
  try {
    const { proposals, sourceIndex } = await fetchAllProposals()
    return Response.json(proposals, { headers: { 'X-Source': `source-${sourceIndex}` } })
  } catch {
    return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 503 })
  }
}
