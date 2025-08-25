import strategies from './strategies'

const HEALTH_CHECK_TYPE = ['lastBlockNumber', 'lastGraphUpdate'] as const

type HealthCheckType = (typeof HEALTH_CHECK_TYPE)[number] | 'all'

type HealthCheckResult = boolean

type HealthCheckFunction = (...args: any[]) => Promise<boolean> | boolean

const HEALTH_CHECKS: Record<Exclude<HealthCheckType, 'all'>, HealthCheckFunction> = {
  lastBlockNumber: strategies.lastBlockNumber,
  lastGraphUpdate: strategies.lastGraphUpdate,
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

export { getHealthCheckByType }

export type { HealthCheckResult, HealthCheckType }
