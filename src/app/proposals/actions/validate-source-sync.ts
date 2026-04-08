import { gql as apolloGQL } from '@apollo/client'
import { getBlockNumber } from 'wagmi/actions'

import { config } from '@/config'
import { PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { daoClient } from '@/shared/components/ApolloClient'

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

/**
 * Verifies that the `SubgraphMetadata` row for governance is within
 * {@link PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD} blocks of the current chain head.
 * Used before trusting DB-backed proposal lists.
 *
 * @throws {Error} When metadata is missing, the chain head cannot be read, or the DB lags too much
 */
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

    if (blockDifference > BigInt(PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD)) {
      throw new Error(
        `Database subgraph metadata is lagging behind: DB block ${dbBlockNumber}, latest block ${latestBlockNumber}, difference ${blockDifference} blocks (threshold: ${PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD})`,
      )
    }
  } catch (error) {
    throw new Error(`Failed to validate DB sync: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetches subgraph `_meta` via a lightweight query and ensures its block is within
 * {@link PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD} of the latest on-chain block.
 *
 * @throws {Error} When metadata cannot be fetched, the chain head cannot be read, or the subgraph lags too much
 */
export async function validateSubgraphSync(): Promise<void> {
  try {
    const { data } = await daoClient.query<SubgraphMetaResponse>({
      query: SUBGRAPH_META_QUERY,
      fetchPolicy: 'no-cache',
    })

    if (!data) {
      throw new Error('Failed to fetch subgraph metadata')
    }

    const subgraphBlockNumber = BigInt(data._meta.block.number)
    const latestBlockNumber = await getBlockNumber(config)

    if (!latestBlockNumber) {
      throw new Error('Failed to fetch latest block number from blockchain')
    }

    const blockDifference = latestBlockNumber - subgraphBlockNumber

    if (blockDifference > BigInt(PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD)) {
      throw new Error(
        `Subgraph is lagging behind: subgraph block ${subgraphBlockNumber}, latest block ${latestBlockNumber}, difference ${blockDifference} blocks (threshold: ${PROPOSAL_METADATA_SYNC_BLOCK_STALENESS_THRESHOLD})`,
      )
    }
  } catch (error) {
    throw new Error(
      `Failed to validate subgraph sync: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}
