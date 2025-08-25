import { BlockChangeLog } from '@/app/api/utils/db.schema'
import { STATE_SYNC_GRAPH_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { daoClient as daoGraphClient, client as tokGraphClient } from '@/shared/components/ApolloClient'
import { gql } from '@apollo/client'
import { BlockNumberFetchError } from '../healthCheck.errors'

const subgraphs = ['tok', 'dao'] as const
type Subgraph = (typeof subgraphs)[number]

const subgraphClients = {
  tok: tokGraphClient,
  dao: daoGraphClient,
}

export const _lastGraphUpdate = async (subgraph: Subgraph = 'tok'): Promise<boolean> => {
  const blockChangeLog = await db<BlockChangeLog>('BlockChangeLog').orderBy('blockTimestamp', 'desc').first()

  if (!blockChangeLog) {
    return false
  }

  const subgraphClient = subgraphClients[subgraph]

  const {
    data: {
      BlockChangeLog: { blockNumber },
    },
  } = await subgraphClient
    .query<{
      BlockChangeLog: {
        blockNumber: string
      }
    }>({
      query: gql`
        query BlockChangeLog {
          blockNumber
        }
      `,
    })
    .catch(() => {
      throw new BlockNumberFetchError()
    })

  const blockNumberOnSubgraph = BigInt(blockNumber)

  return (
    BigInt(blockChangeLog.blockNumber) + BigInt(STATE_SYNC_GRAPH_STALENESS_THRESHOLD) >= blockNumberOnSubgraph
  )
}
