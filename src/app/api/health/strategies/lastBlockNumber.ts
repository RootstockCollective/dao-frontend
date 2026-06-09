import { getBlockNumber } from 'wagmi/actions'

import { LastProcessedBlock } from '@/app/api/utils/db.schema'
import { config } from '@/config'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'

import { BlockNumberFetchError, UnexpectedBehaviourError } from '../healthCheck.errors'

const GET_BLOCK_NUMBER_TIMEOUT_MS = 5_000

export const _lastBlockNumber = async (): Promise<boolean> => {
  const start = Date.now()

  const lastProcessedBlockRecord = await db<LastProcessedBlock>('LastProcessedBlock').first()

  if (!lastProcessedBlockRecord) {
    return false
  }

  if (!lastProcessedBlockRecord.id) {
    throw new UnexpectedBehaviourError(new Error('LastProcessedBlock id should never be falsy, but it is.'))
  }

  const blockNumberOnChain = await Promise.race([
    getBlockNumber(config),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('getBlockNumber timed out in health check')),
        GET_BLOCK_NUMBER_TIMEOUT_MS,
      ),
    ),
  ])

  if (!blockNumberOnChain) {
    throw new BlockNumberFetchError()
  }

  const healthy =
    BigInt(lastProcessedBlockRecord.number) + BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD) >=
    blockNumberOnChain

  logger.info(
    {
      dbBlock: lastProcessedBlockRecord.number,
      chainBlock: blockNumberOnChain.toString(),
      healthy,
      elapsedMs: Date.now() - start,
    },
    'health check lastBlockNumber',
  )

  return healthy
}
