import { WrongHealthCheckTypeError } from './healthCheck.errors'
import { getHealthCheckByType, type HealthCheckType } from './healthCheck.utils'

export const runHealthCheck = async (type: HealthCheckType) => {
  const healthCheck = getHealthCheckByType(type)

  if (!healthCheck) {
    throw new WrongHealthCheckTypeError(type)
  }

  return healthCheck()
}

export type { HealthCheckType }
