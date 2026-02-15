import { getProposalsFromBlockscout } from '@/app/proposals/actions/getProposalsFromBlockscout'
import { getProposalsFromTheGraph } from '@/app/proposals/actions/getProposalsFromTheGraph'
import { getProposalsFromDB } from '@/app/proposals/actions/getProposalsFromDB'
import { sentryServer } from '@/lib/sentry/sentry-server'

export const revalidate = 60

export async function GET() {
  const proposalsSources = [getProposalsFromDB, getProposalsFromTheGraph, getProposalsFromBlockscout]
  const sourceNames = ['DB', 'TheGraph', 'Blockscout']
  let index = -1
  for (const source of proposalsSources) {
    index++
    try {
      const proposals = await source()
      return Response.json(proposals, { headers: { 'X-Source': `source-${index}` } })
    } catch (error) {
      console.error(error)
      const errorObj = error instanceof Error ? error : new Error(String(error))
      sentryServer.captureException(errorObj, {
        tags: {
          errorType: 'PROPOSALS_FETCH_ERROR',
          source: sourceNames[index],
        },
        extra: {
          sourceIndex: index,
          sourceName: sourceNames[index],
        },
      })
    }
  }
  const finalError = new Error('Can not fetch proposals from any source')
  sentryServer.captureException(finalError, {
    tags: {
      errorType: 'PROPOSALS_ALL_SOURCES_FAILED',
    },
  })
  return Response.json({ error: 'Can not fetch proposals from any source' }, { status: 500 })
}
