import { getProposalsFromBlockscout } from '@/app/proposals/actions/getProposalsFromBlockscout'
import { getProposalsFromTheGraph } from '@/app/proposals/actions/getProposalsFromTheGraph'
import { getProposalsFromDB } from '@/app/proposals/actions/getProposalsFromDB'
import { getProposalsFromEnvio } from '@/app/proposals/actions/getProposalsFromEnvio'

export const revalidate = 60

export async function GET() {
  // Fallback chain: Envio -> DB (State Sync) -> TheGraph -> Blockscout
  const proposalsSources = [
    getProposalsFromEnvio,
    getProposalsFromDB,
    getProposalsFromTheGraph,
    getProposalsFromBlockscout,
  ]
  let index = -1
  for (const source of proposalsSources) {
    index++
    try {
      const proposals = await source()
      return Response.json(proposals, { headers: { 'X-Source': `source-${index}` } })
    } catch (error) {
      console.error(error)
    }
  }
  return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
}
