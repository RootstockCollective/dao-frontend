import { config } from '@/config'
import { getBlockNumber } from 'wagmi/actions'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { daoClient } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { db } from '@/lib/db'

const SUBGRAPH_META_QUERY = apolloGQL`
  query GetSubgraphMeta {
    _meta {
      block {
        number
      }
    }
  }
`

interface SubgraphMetaResponse {
  _meta: {
    block: {
      number: number
    }
  }
}

interface SubgraphMetadataRow {
  id: string
  blockNumber: string
}

export async function validateDBSync(): Promise<void> {
  try {
    const metadataRecord = await db<SubgraphMetadataRow>('SubgraphMetadata')
      .where({ id: 'governance' })
      .first()

    if (!metadataRecord) {
      throw new Error('SubgraphMetadata record with id "governance" not found')
    }

    const dbBlockNumber = BigInt(metadataRecord.blockNumber)
    const latestBlockNumber = await getBlockNumber(config)

    if (!latestBlockNumber) {
      throw new Error('Failed to fetch latest block number from blockchain')
    }

    const blockDifference = latestBlockNumber - dbBlockNumber

    if (blockDifference > BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD)) {
      throw new Error(
        `Database subgraph metadata is lagging behind: DB block ${dbBlockNumber}, latest block ${latestBlockNumber}, difference ${blockDifference} blocks (threshold: ${STATE_SYNC_BLOCK_STALENESS_THRESHOLD})`,
      )
    }
  } catch (error) {
    throw new Error(`Failed to validate DB sync: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function validateSubgraphSync(): Promise<void> {
  try {
    const { data } = await daoClient.query<SubgraphMetaResponse>({
      query: SUBGRAPH_META_QUERY,
      fetchPolicy: 'no-cache',
    })

    const subgraphBlockNumber = BigInt(data._meta.block.number)
    const latestBlockNumber = await getBlockNumber(config)

    if (!latestBlockNumber) {
      throw new Error('Failed to fetch latest block number from blockchain')
    }

    const blockDifference = latestBlockNumber - subgraphBlockNumber

    if (blockDifference > BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD)) {
      throw new Error(
        `Subgraph is lagging behind: subgraph block ${subgraphBlockNumber}, latest block ${latestBlockNumber}, difference ${blockDifference} blocks (threshold: ${STATE_SYNC_BLOCK_STALENESS_THRESHOLD})`,
      )
    }
  } catch (error) {
    throw new Error(
      `Failed to validate subgraph sync: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
