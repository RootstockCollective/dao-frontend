import { getProposalsFromBlockscout } from '@/app/proposals/actions/getProposalsFromBlockscout'
import { getProposalsFromTheGraph } from '@/app/proposals/actions/getProposalsFromTheGraph'
import { getProposalsFromDB } from '@/app/proposals/actions/getProposalsFromDB'
import { validateSubgraphSync, validateDBSync } from '@/app/proposals/actions/validateSourceSync'

export const revalidate = 60

export async function GET() {
  const proposalsSources = [
    {
      source: getProposalsFromDB,
      name: 'DB',
      validate: validateDBSync,
    },
    {
      source: getProposalsFromTheGraph,
      name: 'TheGraph',
      validate: validateSubgraphSync,
    },
    {
      source: getProposalsFromBlockscout,
      name: 'Node',
      validate: null,
    },
  ]

  let index = -1
  for (const { source, name, validate } of proposalsSources) {
    index++
    try {
      // Validate synchronization before fetching data
      if (validate) {
        await validate()
      }

      const proposals = await source()
      return Response.json(proposals, {
        headers: {
          'X-Source': `source-${index}`,
          'X-Source-Name': name,
        },
      })
    } catch (error) {
      console.error(`Error with source ${name} (index ${index}):`, error)
    }
  }
  return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
}
