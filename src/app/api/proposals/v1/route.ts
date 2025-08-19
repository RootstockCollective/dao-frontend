import { getProposalsFromNode } from '@/app/services/getProposalsFromNode'
import { getProposalsFromTheGraph } from '@/app/services/getProposalsFromTheGraph'

export const revalidate = 60

export async function GET() {
  const proposalsSources = [getProposalsFromTheGraph, getProposalsFromNode]
  for (const source of proposalsSources) {
    try {
      const proposals = await source()
      return Response.json(proposals)
    } catch (error) {
      console.error(error)
    }
  }
  return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
}
