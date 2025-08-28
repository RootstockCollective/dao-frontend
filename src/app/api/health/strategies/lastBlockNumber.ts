import { LastProcessedBlock } from '@/app/api/utils/db.schema'
import { config } from '@/config'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { getBlockNumber } from 'wagmi/actions'
import { BlockNumberFetchError, UnexpectedBehaviourError } from '../healthCheck.errors'

export const _lastBlockNumber = async (): Promise<boolean> => {
  const lastProcessedBlockRecord = await db<LastProcessedBlock>('LastProcessedBlock').first()

  if (!lastProcessedBlockRecord) {
    return false
  }

  if (!lastProcessedBlockRecord.id) {
    throw new UnexpectedBehaviourError(new Error('LastProcessedBlock id should never be falsy, but it is.'))
  }

  const blockNumberOnChain = await getBlockNumber(config)

  if (!blockNumberOnChain) {
    throw new BlockNumberFetchError()
  }

  return (
    BigInt(lastProcessedBlockRecord.number) + BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD) >=
    blockNumberOnChain
  )
}
