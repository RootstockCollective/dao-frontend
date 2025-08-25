import { WrongHealthCheckTypeError } from './healthCheck.errors'
import { getHealthCheckByType, type HealthCheckType } from './healthCheck.utils'

export const runHealthCheck = async <T extends unknown[] = unknown[]>(type: HealthCheckType, ...args: T) => {
  const healthCheck = getHealthCheckByType(type)

  if (!healthCheck) {
    throw new WrongHealthCheckTypeError(type)
  }

  return healthCheck(...args)
}

export type { HealthCheckType }
