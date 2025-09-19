import { getProposalsFromNode } from '@/app/proposals/actions/getProposalsFromNode'
import { getProposalsFromTheGraph } from '@/app/proposals/actions/getProposalsFromTheGraph'
import { getProposalsFromDB } from '@/app/proposals/actions/getProposalsFromDB'

export const revalidate = 60

export async function GET() {
  const proposalsSources = [getProposalsFromDB, getProposalsFromTheGraph, getProposalsFromNode]
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
