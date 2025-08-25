import { BlockChangeLog } from '@/app/api/utils/db.schema'
import { config } from '@/config'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { getBlockNumber } from 'wagmi/actions'
import { BlockNumberFetchError } from '../healthCheck.errors'

export const _lastBlockNumber = async (): Promise<boolean> => {
  const blockChangeLog = await db<BlockChangeLog>('BlockChangeLog').orderBy('blockTimestamp', 'desc').first()

  if (!blockChangeLog) {
    return false
  }

  const blockNumberOnChain = await getBlockNumber(config)

  if (!blockNumberOnChain) {
    throw new BlockNumberFetchError()
  }

  return (
    BigInt(blockChangeLog.blockNumber) + BigInt(STATE_SYNC_BLOCK_STALENESS_THRESHOLD) >= blockNumberOnChain
  )
}
