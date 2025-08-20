import { BlockChangeLog } from '@/app/api/utils/db.schema'
import { config } from '@/config'
import { STATE_SYNC_BLOCK_STALENESS_THRESHOLD } from '@/lib/constants'
import { db } from '@/lib/db'
import { getBlockNumber } from 'wagmi/actions'
import { BlockNumberFetchError } from './healthCheck.errors'

const HEALTH_CHECK_TYPE = ['lastBlockNumber'] as const

type HealthCheckType = (typeof HEALTH_CHECK_TYPE)[number] | 'all'

type HealthCheckResult = boolean

const _lastBlockNumber = async (): Promise<boolean> => {
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

type HealthCheckFunction = () => Promise<boolean>

const HEALTH_CHECKS: Record<Exclude<HealthCheckType, 'all'>, HealthCheckFunction> = {
  lastBlockNumber: _lastBlockNumber,
}

const _checkAll = async (): Promise<boolean> => {
  return (await Promise.allSettled(HEALTH_CHECK_TYPE.map(checkType => HEALTH_CHECKS[checkType]()))).every(
    result => result.status === 'fulfilled' && result.value,
  )
}

const getHealthCheckByType = (type: HealthCheckType): HealthCheckFunction | undefined => {
  if (!type || type === 'all') {
    return _checkAll
  }

  return HEALTH_CHECKS[type]
}

export { _checkAll, _lastBlockNumber }

export { getHealthCheckByType }

export type { HealthCheckResult, HealthCheckType }
